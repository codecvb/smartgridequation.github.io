---
title: stm32实现按键单击双击三击长按功能的proteus8仿真
slug: stm32实现按键单击双击三击长按功能的proteus8仿真
category: 嵌入式与硬件
summary: 本文展示了一个基于STM32F1的按键检测与LED控制系统。
tags: 随笔
---

本文展示了一个基于STM32F1的按键检测与LED控制系统。


系统通过硬件消抖和状态机实现稳定检测4种按键事件：单击(PA9)、双击(PA10)、三击(PA11)和长按(PA12)。按键模块采用结构体封装状态参数，包括消抖时间(6ms)、点击间隔(50ms)和长按判定(200ms)。


LED模块提供独立控制各LED的接口，事件触发后相应LED会短暂点亮。


主程序通过状态机轮询检测按键事件，并调用对应LED控制函数，实现按键动作与LED指示的精确对应。


代码如下


led.h


```cpp
#ifndef __LED_H
#define __LED_H

#include "stm32f1xx_hal.h"

// LED控制函数声明
void LED_Init(void);
void LED_ClickOn(void);
void LED_ClickOff(void);
void LED_DoubleClickOn(void);
void LED_DoubleClickOff(void);
void LED_TripleClickOn(void);
void LED_TripleClickOff(void);
void LED_LongPressOn(void);
void LED_LongPressOff(void);
void LED_AllOn(void);
void LED_AllOff(void);

#endif /* __LED_H */

```


led.c


```cpp
#include "led.h"

// LED初始化（已在main.c的GPIO初始化中完成硬件配置）
void LED_Init(void) {
  // 初始化时关闭所有LED
  LED_AllOff();
}

// 单击LED控制（PA9）
void LED_ClickOn(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_9, GPIO_PIN_RESET);  // 假设低电平点亮
}
void LED_ClickOff(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_9, GPIO_PIN_SET);
}

// 双击LED控制（PA10）
void LED_DoubleClickOn(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_10, GPIO_PIN_RESET);
}
void LED_DoubleClickOff(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_10, GPIO_PIN_SET);
}

// 三击LED控制（PA11）
void LED_TripleClickOn(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_11, GPIO_PIN_RESET);
}
void LED_TripleClickOff(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_11, GPIO_PIN_SET);
}

// 长按LED控制（PA12）
void LED_LongPressOn(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_12, GPIO_PIN_RESET);
}
void LED_LongPressOff(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_12, GPIO_PIN_SET);
}

// 所有LED打开
void LED_AllOn(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_9 | GPIO_PIN_10 | GPIO_PIN_11 | GPIO_PIN_12, GPIO_PIN_RESET);
}

// 所有LED关闭
void LED_AllOff(void) {
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_9 | GPIO_PIN_10 | GPIO_PIN_11 | GPIO_PIN_12, GPIO_PIN_SET);
}

```


key.h


```cpp
#ifndef __KEY_H
#define __KEY_H

#include "stm32f1xx_hal.h"

// 按键状态定义
typedef enum {
  KEY_RELEASED = 0,  // 按键释放
  KEY_PRESSED        // 按键按下
} Key_State_TypeDef;

// 按键事件定义
typedef enum {
  KEY_EVENT_NONE = 0,       // 无事件
  KEY_EVENT_CLICK,          // 单击事件
  KEY_EVENT_DOUBLE_CLICK,   // 双击事件
  KEY_EVENT_TRIPLE_CLICK,   // 三击事件
  KEY_EVENT_LONG_PRESS      // 长按事件
} Key_Event_TypeDef;

// 按键结构体定义
typedef struct {
  uint16_t debounce_time;    // 消抖时间(ms)
  uint16_t click_interval;   // 点击间隔时间(ms)
  uint16_t long_press_time;  // 长按判定时间(ms)

  Key_State_TypeDef state;   // 当前按键状态
  Key_State_TypeDef last_state; // 上一次按键状态

  uint32_t press_time;       // 按下时间戳
  uint32_t release_time;     // 释放时间戳
  uint8_t click_count;       // 点击计数

  Key_Event_TypeDef event;   // 按键事件
} Key_TypeDef;

// 函数声明
void Key_Init(Key_TypeDef *key, uint16_t debounce, uint16_t interval, uint16_t long_press);
void Key_Scan(Key_TypeDef *key);
Key_Event_TypeDef Key_GetEvent(Key_TypeDef *key);
Key_State_TypeDef Key_ReadState(Key_TypeDef *key);

#endif /* __KEY_H */

```


key.c


```cpp
#include "key.h"
#include "main.h"

// 获取当前时间(ms)
//static uint32_t Key_GetTick(void) {
//  return TIM2->CNT;  // 使用定时器6的计数器值作为时间基准
//}

int flag = 0;
uint32_t current_time;

Key_Event_TypeDef event;

uint32_t  Key_GetTick(void) {
    return HAL_GetTick();
}

// 读取按键原始状态（未消抖）
static Key_State_TypeDef Key_ReadRawState(void) {
  // 读取PA5引脚状态，按键按下时为低电平
  if (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_5) == GPIO_PIN_SET) {
    return KEY_PRESSED;
  } else {
    return KEY_RELEASED;
  }
}

// 按键初始化
void Key_Init(Key_TypeDef *key, uint16_t debounce, uint16_t interval, uint16_t long_press) {
  key->debounce_time = debounce;
  key->click_interval = interval;
  key->long_press_time = long_press;

  key->state = KEY_RELEASED;
  key->last_state = KEY_RELEASED;

  key->press_time = 0;
  key->release_time = 0;
  key->click_count = 0;

  key->event = KEY_EVENT_NONE;
}

// 按键扫描（状态机实现）
void Key_Scan(Key_TypeDef *key) {
    uint32_t current_time = Key_GetTick();
    Key_State_TypeDef raw_state = Key_ReadRawState();

    // 状态机处理
    switch(key->state) {
        case KEY_RELEASED:
            // 检测到按键按下，进入消抖和按下状态
            if (raw_state == KEY_PRESSED) {
                key->press_time = current_time;
                key->state = KEY_PRESSED;
            }
            // 检查多击间隔超时
            else if (key->click_count > 0 &&
                    current_time - key->release_time >= key->click_interval) {
                // 根据点击次数设置事件
                switch(key->click_count) {
                    case 1:
                        key->event = KEY_EVENT_CLICK;
                        break;
                    case 2:
                        key->event = KEY_EVENT_DOUBLE_CLICK;
                        break;
                    case 3:
                        key->event = KEY_EVENT_TRIPLE_CLICK;
                        break;
                    default:
                        key->event = KEY_EVENT_NONE;
                        break;
                }
                key->click_count = 0;  // 重置点击计数
            }
            break;

        case KEY_PRESSED:
            // 检测长按
            if (raw_state == KEY_PRESSED &&
                current_time - key->press_time >= key->long_press_time) {
                key->event = KEY_EVENT_LONG_PRESS;
                key->state = KEY_RELEASED;  // 长按后回到释放状态
                key->click_count = 0;       // 重置点击计数
            }
            // 按键释放
            else if (raw_state == KEY_RELEASED) {
                key->release_time = current_time;
                key->click_count++;         // 增加点击计数
                key->state = KEY_RELEASED;  // 回到释放状态

                // 三击后直接触发事件（避免等待间隔）
                if (key->click_count >= 3) {
                    key->event = KEY_EVENT_TRIPLE_CLICK;
                    key->click_count = 0;
                }
            }
            break;
    }
}

// 获取按键事件
Key_Event_TypeDef Key_GetEvent(Key_TypeDef *key) {
  event = key->event;
  key->event = KEY_EVENT_NONE;  // 读取后清除事件
  return event;
}

// 读取当前按键状态（已消抖）
Key_State_TypeDef Key_ReadState(Key_TypeDef *key) {
  return key->state;
}

```


main.c


```cpp
/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2025 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "key.h"
#include "led.h"
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

TIM_HandleTypeDef htim2;

// 按键对象
Key_TypeDef key;

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/
 TIM_HandleTypeDef htim2;

/* USER CODE BEGIN PV */
extern  int flag;
extern Key_Event_TypeDef event;
/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_TIM2_Init(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_TIM2_Init();
  /* USER CODE BEGIN 2 */


  // 初始化LED
  LED_Init();

  // 初始化按键：消抖20ms，点击间隔300ms，长按1000ms
  Key_Init(&key, 6, 50, 200);

  // 启动定时器，用于按键扫描计时
  HAL_TIM_Base_Start(&htim2);

  // 关闭所有LED
  LED_AllOff();


  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */

    //按键扫描
    Key_Scan(&key);

    // 获取按键事件
    Key_Event_TypeDef event = Key_GetEvent(&key);

    // 根据事件控制LED
    switch(event) {
      case KEY_EVENT_CLICK:
        LED_ClickOn();      // 单击 - PA9亮
        HAL_Delay(50);     // 亮500ms
        LED_ClickOff();
        break;

      case KEY_EVENT_DOUBLE_CLICK:
        LED_DoubleClickOn();// 双击 - PA10亮
        HAL_Delay(50);
        LED_DoubleClickOff();
        break;

      case KEY_EVENT_TRIPLE_CLICK:
        LED_TripleClickOn();// 三击 - PA11亮
        HAL_Delay(50);
        LED_TripleClickOff();
        break;

      case KEY_EVENT_LONG_PRESS:
        LED_LongPressOn();  // 长按 - PA12亮
				HAL_Delay(100);
        LED_LongPressOff();

        break;

      default:
        break;
    }

    HAL_Delay(10);

  }


  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.HSEPredivValue = RCC_HSE_PREDIV_DIV1;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL9;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief TIM2 Initialization Function
  * @param None
  * @retval None
  */
static void MX_TIM2_Init(void)
{

  /* USER CODE BEGIN TIM2_Init 0 */

  /* USER CODE END TIM2_Init 0 */

  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_SlaveConfigTypeDef sSlaveConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};

  /* USER CODE BEGIN TIM2_Init 1 */

  /* USER CODE END TIM2_Init 1 */
  htim2.Instance = TIM2;
  htim2.Init.Prescaler = 7199;
  htim2.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim2.Init.Period = 99999;
  htim2.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim2.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  if (HAL_TIM_Base_Init(&htim2) != HAL_OK)
  {
    Error_Handler();
  }
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  if (HAL_TIM_ConfigClockSource(&htim2, &sClockSourceConfig) != HAL_OK)
  {
    Error_Handler();
  }
  sSlaveConfig.SlaveMode = TIM_SLAVEMODE_TRIGGER;
  sSlaveConfig.InputTrigger = TIM_TS_ITR0;
  if (HAL_TIM_SlaveConfigSynchro(&htim2, &sSlaveConfig) != HAL_OK)
  {
    Error_Handler();
  }
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  if (HAL_TIMEx_MasterConfigSynchronization(&htim2, &sMasterConfig) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN TIM2_Init 2 */

  /* USER CODE END TIM2_Init 2 */

}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOC_CLK_ENABLE();
  __HAL_RCC_GPIOD_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();

  /*Configure GPIO pin Output Level */


  /*Configure GPIO pin : PA5 */
  GPIO_InitStruct.Pin = GPIO_PIN_5;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_PULLDOWN;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /*Configure GPIO pin : PA9 */
  GPIO_InitStruct.Pin = GPIO_PIN_9;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_PULLUP;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /*Configure GPIO pins : PA10 PA11 PA12 */
  GPIO_InitStruct.Pin = GPIO_PIN_10|GPIO_PIN_11|GPIO_PIN_12;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_PULLDOWN;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

}

/* USER CODE BEGIN 4 */


/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
```


效果如下，包含了长按，三连击，双击，单击的效果：


![](/uploads/csdn/stm32实现按键单击双击三击长按功能的proteus8仿真/img-01.gif)
