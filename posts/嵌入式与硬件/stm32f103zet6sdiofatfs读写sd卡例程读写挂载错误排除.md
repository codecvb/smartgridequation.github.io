---
title: STM32F103ZET6SDIOFATFS读写SD卡例程读写挂载错误排除
slug: stm32f103zet6sdiofatfs读写sd卡例程读写挂载错误排除
category: 嵌入式与硬件
summary: 一、首先我们要对串口进行重定向（在没有屏幕或者其他提示的情况下方便调试错误），注意在flash config里面勾选microlib。
tags: 嵌入式, 物联网, STM32
---

## 一、首先我们要对串口进行重定向（在没有屏幕或者其他提示的情况下方便调试错误），注意在flash config里面勾选microlib。


```cpp
int fputc(int ch,FILE *f){
	HAL_UART_Transmit(&huart1,(uint8_t *)&ch,1,1000);
	return ch;
}
```


重定向过程中遇到如下问题：编译时出现error: #20: identifier “FILE” is undefined


解决方法：


        1、在该函数的定义中添加#include "stdio.h"头文件


        2、添加了头文件依旧报错，这时候其实和头文件没有关系了，我们要在FILE的使用之前定义


```cpp
typedef struct __FILE FILE;
```


## 二、接下来要配置SDIO和FATFS


参考配置：[FATFS SDIO配置方法](https://blog.csdn.net/weixin_43996864/article/details/134485510 "FATFS SDIO配置方法")


[参考文件读写方式：FATFS 文件读写方法参考](https://blog.csdn.net/m0_68510271/article/details/136030088 "参考文件读写方式：FATFS 文件读写方法参考")


出现的问题：


###         1、SD卡HAL库初始化成功，能顾正确读取存储卡信息（可用容量与总容量），但是挂载不成功


（1）


```cpp
res = f_mount(&fs_t, "0:", 1);       /* 挂载SD卡 */
```


返回值为1，FR\_DISK\_ERR,            /\* (1) A hard error occurred in the low level disk I/O layer \*/


原因是因为分配的读取速度过快，修改方式 hsd.Init.ClockDiv = 9;要根据你的SDIO实际的总线频率来修改，和时钟树有关


```cpp
void MX_SDIO_SD_Init(void)
{

  /* USER CODE BEGIN SDIO_Init 0 */

  /* USER CODE END SDIO_Init 0 */

  /* USER CODE BEGIN SDIO_Init 1 */

  /* USER CODE END SDIO_Init 1 */
  hsd.Instance = SDIO;
  hsd.Init.ClockEdge = SDIO_CLOCK_EDGE_RISING;
  hsd.Init.ClockBypass = SDIO_CLOCK_BYPASS_DISABLE;
  hsd.Init.ClockPowerSave = SDIO_CLOCK_POWER_SAVE_DISABLE;
  hsd.Init.BusWide = SDIO_BUS_WIDE_1B;
  hsd.Init.HardwareFlowControl = SDIO_HARDWARE_FLOW_CONTROL_DISABLE;
  hsd.Init.ClockDiv = 9;
  /* USER CODE BEGIN SDIO_Init 2 */

  /* USER CODE END SDIO_Init 2 */

}
```


（2）返回值为3，FR\_NOT\_READY,            /\* (3) The physical drive cannot work \*/


原因是因为存储卡有热插拔检测，在你设置的热插拔检测IO口上，将它设置为输入，并且设置为下拉输入，可以免除没有检测连接的影响


![](/uploads/csdn/stm32f103zet6sdiofatfs读写sd卡例程读写挂载错误排除/img-01.png)


![](/uploads/csdn/stm32f103zet6sdiofatfs读写sd卡例程读写挂载错误排除/img-02.png)


(2)、代码如下，返回值是11，FR\_INVALID\_DRIVE,        /\* (11) The logical drive number is invalid \*/


```cpp
res = f_mount(&fs_t, "1:", 1);       /* 挂载SD卡 */
```


原因是卷名不能是1，改成0就行了，和上面的代码一样。


### 2、f\_open和f\_write返回值为1，FR\_DISK\_ERR,            /\* (1) A hard error occurred in the low level disk I/O layer \*/


代码如下：


```cpp
res = f_open(&file, "0:TestData.txt", FA_CREATE_ALWAYS | FA_WRITE);

res = f_write(&file, temp_data, strlen((const char*)temp_data), &bytes_written);
```


参考1的修改，原因是一样的。


## 三、我的工程main.c代码如下


```cpp
/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2024 STMicroelectronics.
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
#include "fatfs.h"
#include "sdio.h"
#include "usart.h"
#include "gpio.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include <stdarg.h>
#include <sdio.h>
#include <string.h>
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
//写fatfs 文件--写字符串数据
typedef struct
	{
		uint8_t Soft_Version[16];//软件版本号
		uint8_t Hard_Version[16];
	}MasterDP_t;

FIL file;
uint8_t res;
UINT bytes_written;
FATFS fs_t;

extern SD_HandleTypeDef hsd;

typedef struct __FILE FILE;

int fputc(int ch, FILE* f)
{
	//函数原型 HAL_UART_Transmit(UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size, uint32_t Timeout)
	HAL_UART_Transmit(&huart2,(uint8_t *)&ch, 1, 10);
	return ch;
}

uint8_t rx_data;

uint8_t exfuns_get_free(uint8_t *pdrv, uint32_t *total, uint32_t *free)
{
    FATFS *fs1;
    uint8_t res;
    uint32_t fre_clust = 0, fre_sect = 0, tot_sect = 0;

    /* 得到磁盘信息及空闲簇数量 */
    res = (uint32_t)f_getfree((const TCHAR *)pdrv, (DWORD *)&fre_clust, &fs1);

    if (res == 0)
    {
        tot_sect = (fs1->n_fatent - 2) * fs1->csize;    /* 得到总扇区数 */
        fre_sect = fre_clust * fs1->csize;              /* 得到空闲扇区数 */
#if FF_MAX_SS!=512  /* 扇区大小不是512字节,则转换为512字节 */
        //tot_sect *= fs1->ssize / 512;
        //fre_sect *= fs1->ssize / 512;
#endif
        *total = tot_sect >> 1;     /* 单位为KB */
        *free = fre_sect >> 1;      /* 单位为KB */
    }

    return res;
}
/* USER CODE END 0 */


/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  /* USER CODE BEGIN 1 */
	uint32_t total;
	uint32_t free;
	MasterDP_t DP = {"V1.01","V1.01"};
	uint8_t temp_data[256] = {0};
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
  MX_SDIO_SD_Init();
  MX_USART2_UART_Init();
  MX_FATFS_Init();
  /* USER CODE BEGIN 2 */
	//uint8_t state;
	uint8_t status = HAL_SD_Init(&hsd); /* 初始化 */
	if(status != HAL_OK)
	{
		printf("SD card initialize failed!\n");
		while(1)
		{
			HAL_Delay(1000);
			printf("SD card initialize failed!\n");
		}
	}
    HAL_SD_CardStateTypeDef state = HAL_SD_GetCardState(&hsd);

    if(state == HAL_SD_CARD_TRANSFER)
    {
        //HAL_SD_GetCardCID(&hsd, &SD_CardCID);
        printf("\nInitialize SD card sucessfully!\r\n");
        printf("\nSD card information\r\n");
        printf("\nCapacity              :%llu\r\n", ((unsigned long long)hsd.SdCard.BlockSize*hsd.SdCard.BlockNbr));
        printf("\nBlockSize             :%d\r\n", hsd.SdCard.BlockSize);
        printf("\nRCA                   :%d\r\n", hsd.SdCard.RelCardAdd);
        printf("\nCardType              :%d\r\n", hsd.SdCard.CardType);
        //printf("\nManufacturerID        :%d\r\n", SD_CardCID.ManufacturerID);
    }

	HAL_SD_InitCard(&hsd);

	res = f_mount(&fs_t, "0:", 1);       /* 挂载SD卡 */
  //res = f_mount(&fs, "1:", 1); /* 挂载FLASH.	*/
	if(res!=0){

		//HAL_UART_Transmit(&huart2,(uint8_t*)"挂载失败！\r\n",20,50);
		printf("失败代码：%d\r\n",res);

	}
	else{
		printf("挂载成功！\r\n");
	}
  exfuns_get_free((uint8_t*)"0", &total, &free);

	//uint8_t total_t = total>>10;
	//uint8_t free_t = free>>10;

	printf("总容量：%ld\r\n",(long)total);
	printf("剩余容量：%ld\r\n",(long)free);


	// 创建文件
	res = f_open(&file, "0:TestData.txt", FA_CREATE_ALWAYS | FA_WRITE);
	if (res != FR_OK) {
			printf("Failed to create file\n");
			return 1;
	}
	else{

		printf("创建成功！\r\n");

	}

	// 待写入的数组buffer
	//sprintf((char*)temp_data,"HardVersion:%s,SoftVersion:%s",DP.Hard_Version,DP.Soft_Version);
	// 格式化字符串数据
	for(int i = 0;i<256;i++){
		temp_data[i] = '0'+i;
	}
	res = f_write(&file, temp_data, strlen((const char*)temp_data), &bytes_written);
	if (res != FR_OK) {
			printf("Failed to write data to file %d\n",res);
			f_close(&file);
			return 1;
	}

	// 关闭文件
	f_close(&file);

	printf("Data written to file successfully\n");

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
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


## 四、最后实现效果


![](/uploads/csdn/stm32f103zet6sdiofatfs读写sd卡例程读写挂载错误排除/img-03.png)


![](/uploads/csdn/stm32f103zet6sdiofatfs读写sd卡例程读写挂载错误排除/img-04.png)


## 五、如果需要源代码或者有问题，请私信我，我将把源代码发给你。或者告诉我邮箱就好。
