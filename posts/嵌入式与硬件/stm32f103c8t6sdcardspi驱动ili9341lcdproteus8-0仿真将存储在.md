---
title: STM32F103C8T6SDcardSPI驱动ILI9341LCDPROTEUS8.0仿真将存储在
slug: stm32f103c8t6sdcardspi驱动ili9341lcdproteus8-0仿真将存储在
category: 嵌入式与硬件
summary: 本文展示了一个基于STM32微控制器的SD卡文件读取系统。系统通过SPI接口连接SD卡，实现了FAT12文件系统的解析功能。主要功能包括：1) 读取SD卡基本信息(容量、类型)；2) 解析FAT12文件系统的引导扇区参数；3) 搜索并定位指定文件；4) 在ILI9341 LCD屏幕上显示文本文件内容。系统还包含文件列表显示功能，可查看SD卡中的文件信息。程序使用HAL库进行硬件初始化，通过状态指示…
tags: 嵌入式, 物联网, STM32
---

本文展示了一个基于STM32微控制器的SD卡文件读取系统。系统通过SPI接口连接SD卡，实现了FAT12文件系统的解析功能。主要功能包括：1) 读取SD卡基本信息(容量、类型)；2) 解析FAT12文件系统的引导扇区参数；3) 搜索并定位指定文件；4) 在ILI9341 LCD屏幕上显示文本文件内容。系统还包含文件列表显示功能，可查看SD卡中的文件信息。程序使用HAL库进行硬件初始化，通过状态指示灯反馈操作状态。该系统实现了从SD卡读取文本文件并显示的基本功能框架。


![](/uploads/csdn/stm32f103c8t6sdcardspi驱动ili9341lcdproteus8-0仿真将存储在/img-01.png)


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
  * <h2><center>&copy; Copyright (c) 2020 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under BSD 3-Clause license,
  * the "License"; You may not use this file except in compliance with the
  * License. You may obtain a copy of the License at:
  *                        opensource.org/licenses/BSD-3-Clause
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "spi.h"
#include "usart.h"
#include "gpio.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "bmp.h"
#include "txt.h"
#include "ILI9341.h"
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

void SD_RdWrTest(void)
{
    int i = 0;
    static uint8_t bufr[SD_SECTOR_SIZE];
    static uint8_t bufw[SD_SECTOR_SIZE];

    for(i = 0; i < sizeof(bufw); i++)
    {
        bufr[i] = 0;
        bufw[i] = i % 0xFF;
    }

    SD_WriteDisk(bufw, 1, 1);
    SD_ReadDisk(bufr, 1, 1);
    printf("# SD Card Read & Write Test %s!\r\n", memcmp(bufr, bufw, sizeof(bufr)) == 0 ? "Successfully" : "Failed");
}

extern SPI_HandleTypeDef hspi2;

int main()
{
    uint64_t CardSize = 0;
    HAL_Init();
    SystemClock_Config();
    MX_GPIO_Init();
    MX_USART1_UART_Init();
    MX_SPI1_Init();
    MX_SPI2_Init();
    printf("\r\n\r\n####################### HAL Libary SD Card SPI Demo ################################\r\n");

    while(SD_Initialize() != 0)
    {
        HAL_GPIO_TogglePin(LED0_GPIO_Port, LED0_Pin);
        HAL_Delay(1000);
        printf("## [Warining]: sd card not found !\r\n");
    }

    CardSize = SD_GetSectorCount();
    CardSize = CardSize * SD_SECTOR_SIZE / 1024 / 1024;

    printf("# SD Card Type:0x%02X\r\n", SD_Type);
    printf("# SD Card Size:%lldMB\r\n", CardSize);

    ILI9341_begin(&hspi2);
    //ILI9341_fillScreen(ILI9341_GREEN);
    printf("# LCD Initialized\r\n");

    printf("# Displaying 1.TXT...\r\n");
    if(TXT_Display("1.txt", &hspi2) == 0)
    {
        printf("# TXT Display Success!\r\n");
    }
    else
    {
        printf("# TXT Display Failed!\r\n");
    }

		HAL_Delay(1000);

    printf("# Displaying 2.BMP...\r\n");
    if(BMP_Display("2.bmp", &hspi2) == 0)
    {
        printf("# BMP Display Success!\r\n");
    }
    else
    {
        printf("# BMP Display Failed!\r\n");
    }


    while(1)
    {
        HAL_GPIO_TogglePin(LED1_GPIO_Port, LED1_Pin);
        HAL_Delay(1000);
    }
}

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */

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
       tex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
```


txt.c


```cpp
#include "txt.h"
#include "mmc_sd.h"
#include "ILI9341.h"
#include "main.h"
#include <string.h>
#include <stdio.h>

extern SPI_HandleTypeDef hspi1;

// 全局变量保存文件系统参数
static uint32_t g_bytesPerSector = 512;
static uint32_t g_sectorsPerCluster = 1;
static uint32_t g_reservedSectors = 1;
static uint32_t g_sectorsPerFat = 9;
static uint32_t g_rootEntries = 224;
static uint32_t g_fatStart = 1;
static uint32_t g_rootSector = 19;
static uint32_t g_dataStart = 33;
static uint8_t g_numberOfFATs = 2;

static uint8_t FAT12_ReadBootSector(uint32_t* bytesPerSector, uint32_t* sectorsPerFat, uint32_t* rootEntries, uint32_t* reservedSectors, uint32_t* fatStart, uint32_t* sectorsPerCluster);
static uint8_t FAT12_FindFile(const char* filename, uint32_t* firstCluster, uint32_t* size);
static uint16_t FAT12_GetFatEntry(uint16_t cluster);
static void FAT12_ParseBootSector(uint8_t* buffer);

// 简单的延迟函数
static void delay_small(void) {
    volatile int i;
    for (i = 0; i < 1000; i++);
}

// 解析引导扇区
static void FAT12_ParseBootSector(uint8_t* buffer) {
    g_bytesPerSector = buffer[11] | (buffer[12] << 8);
    g_sectorsPerCluster = buffer[13];
    g_reservedSectors = buffer[14] | (buffer[15] << 8);
    g_numberOfFATs = buffer[16];
    g_rootEntries = buffer[17] | (buffer[18] << 8);
    g_sectorsPerFat = buffer[22] | (buffer[23] << 8);

    if (g_sectorsPerFat == 0) {
        g_sectorsPerFat = 9;
    }

    g_fatStart = g_reservedSectors;
    g_rootSector = g_fatStart + (g_numberOfFATs * g_sectorsPerFat);
    uint32_t rootDirSectors = ((g_rootEntries * 32) + (g_bytesPerSector - 1)) / g_bytesPerSector;
    g_dataStart = g_rootSector + rootDirSectors;

    printf("TXT: BootSector\r\n");
    printf("  bps=%lu spc=%lu res=%lu fat=%lu\r\n",
           g_bytesPerSector, g_sectorsPerCluster, g_reservedSectors, g_sectorsPerFat);
    printf("  root=%lu data=%lu\r\n", g_rootSector, g_dataStart);
}

static uint8_t FAT12_ReadBootSector(uint32_t* bytesPerSector, uint32_t* sectorsPerFat, uint32_t* rootEntries, uint32_t* reservedSectors, uint32_t* fatStart, uint32_t* sectorsPerCluster) {
    uint8_t buffer[512];
    uint8_t result;
    int retry = 3;
    int i;

    printf("TXT: RD boot...\r\n");

    while (retry > 0) {
        result = SD_ReadDisk(buffer, 0, 1);
        if (result == 0) break;
        printf("TXT: retry %d\r\n", retry);
        delay_small();
        retry--;
    }

    if (result != 0) {
        printf("TXT: boot fail=%u\r\n", result);
        printf("TXT: Using defaults\r\n");
        g_bytesPerSector = 512;
        g_sectorsPerCluster = 1;
        g_reservedSectors = 1;
        g_sectorsPerFat = 9;
        g_rootEntries = 224;
        g_fatStart = 1;
        g_numberOfFATs = 2;
        g_rootSector = 19;
        g_dataStart = 33;

        *bytesPerSector = 512;
        *sectorsPerCluster = 1;
        *reservedSectors = 1;
        *sectorsPerFat = 9;
        *rootEntries = 224;
        *fatStart = 1;
        return 0;
    }

    printf("TXT: boot OK, hex:\r\n");

    for (i = 0; i < 32; i++) {
        printf("%02X ", buffer[i]);
        if (i == 15) printf("\r\n");
    }
    printf("\r\n");

    FAT12_ParseBootSector(buffer);

    *bytesPerSector = g_bytesPerSector;
    *sectorsPerCluster = g_sectorsPerCluster;
    *reservedSectors = g_reservedSectors;
    *sectorsPerFat = g_sectorsPerFat;
    *rootEntries = g_rootEntries;
    *fatStart = g_fatStart;

    return 0;
}

static uint16_t FAT12_GetFatEntry(uint16_t cluster) {
    uint8_t fatBuffer[512];
    uint32_t fatOffset;
    uint32_t fatSector;
    uint16_t entry;

    if (cluster < 2) return 0xFFF;

    fatOffset = cluster + (cluster / 2);
    fatSector = g_fatStart + fatOffset / 512;
    uint16_t offsetInSector = fatOffset % 512;

    if (SD_ReadDisk(fatBuffer, fatSector, 1) != 0) {
        printf("TXT: FAT read err\r\n");
        return 0xFF;
    }

    entry = fatBuffer[offsetInSector] | (fatBuffer[offsetInSector + 1] << 8);

    if (cluster % 2 == 0) {
        return entry & 0x0FFF;
    } else {
        return entry >> 4;
    }
}

static uint8_t FAT12_FindFile(const char* filename, uint32_t* firstCluster, uint32_t* size) {
    uint8_t buffer[512];
    uint32_t rootDirSectors;
    uint32_t i, j;
    char name[11];
    uint32_t nameIdx = 0;

    printf("TXT: FindFile: %s\r\n", filename);
    printf("TXT: check1\r\n");

    rootDirSectors = ((g_rootEntries * 32) + (g_bytesPerSector - 1)) / g_bytesPerSector;
    printf("TXT: check2\r\n");

    memset(name, ' ', 11);
    printf("TXT: check3\r\n");
    for (i = 0; filename[i] != '\0' && i < 8 && filename[i] != '.'; i++) {
        name[i] = filename[i];
    }
    if (filename[i] == '.') {
        i++;
        for (; filename[i] != '\0' && nameIdx < 3; i++) {
            name[8 + nameIdx] = filename[i];
            nameIdx++;
        }
    }
    for (i = 0; i < 11; i++) {
        if (name[i] >= 'a' && name[i] <= 'z') {
            name[i] = name[i] - 'a' + 'A';
        }
    }

    //printf("TXT: Looking for [%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X]\r\n",
    //       name[0], name[1], name[2], name[3], name[4], name[5], name[6], name[7], name[8], name[9], name[10]);

    for (i = 0; i < rootDirSectors; i++) {
        //printf("TXT: reading root sector %lu...\r\n", g_rootSector + i);
        if (SD_ReadDisk(buffer, g_rootSector + i, 1) != 0) {
            //printf("TXT: root%lu read err\r\n", g_rootSector + i);
            continue;
        }
        printf("TXT: root sector read OK\r\n");

        for (j = 0; j < 16; j++) {
            uint8_t* entry = &buffer[j * 32];

            if (entry[0] == 0x00) {
                printf("TXT: EOF\r\n");
                return 1;
            }
            if (entry[0] == 0xE5) continue;
            if (entry[11] == 0x0F) continue;
            if (entry[11] & 0x08) continue;

            if (memcmp(entry, name, 11) == 0) {
                *firstCluster = entry[26] | (entry[27] << 8);
                *size = entry[28] | (entry[29] << 8) | (entry[30] << 16) | (entry[31] << 24);
                //printf("TXT: Found! cluster=%lu size=%lu\r\n", *firstCluster, *size);
                return 0;
            }
        }
    }

    printf("TXT: Not found\r\n");
    return 1;
}

uint8_t TXT_Display(const char* filename, SPI_HandleTypeDef* hspi) {
    uint32_t firstCluster, fileSize;
    uint8_t sectorBuffer[512];
    uint16_t currentCluster, nextCluster;
    uint32_t sectorInCluster;
    uint32_t bytesRead;
    uint8_t result;
    uint16_t cursorX, cursorY;

    (void)hspi;

    printf("\r\n========================================\r\n");
    printf("TXT: Opening: %s\r\n", filename);

    result = FAT12_FindFile(filename, &firstCluster, &fileSize);
    if (result != 0) {
        printf("TXT: File not found\r\n");
        ILI9341_fillScreen(ILI9341_BLACK);
        ILI9341_setCursor(0, 0);
        ILI9341_setTextColor(ILI9341_RED);
        ILI9341_print("File not found!");
        return result;
    }

    //printf("TXT: File cluster=%lu size=%lu\r\n", firstCluster, fileSize);

    ILI9341_fillScreen(ILI9341_BLACK);
    ILI9341_setCursor(0, 0);
    ILI9341_setTextColor(ILI9341_WHITE);
    ILI9341_setTextSize(1);

    currentCluster = firstCluster;
    sectorInCluster = 0;
    bytesRead = 0;
    cursorX = 0;
    cursorY = 0;

    printf("TXT: Reading content...\r\n");

    while (bytesRead < fileSize) {
        uint32_t sector = g_dataStart + (currentCluster - 2) * g_sectorsPerCluster + sectorInCluster;

        result = SD_ReadDisk(sectorBuffer, sector, 1);
        if (result != 0) {
            printf("TXT: sector%lu err\r\n", sector);
            delay_small();
            result = SD_ReadDisk(sectorBuffer, sector, 1);
            if (result != 0) {
                printf("TXT: retry fail\r\n");
                return result;
            }
        }

        for (uint32_t i = 0; i < g_bytesPerSector && bytesRead < fileSize; i++) {
            uint8_t c = sectorBuffer[i];
            bytesRead++;

            if (c >= 32 && c <= 126) {
                ILI9341_write(c);
                cursorX += 6;
                if (cursorX >= 234) {
                    cursorX = 0;
                    cursorY += 8;
                    ILI9341_setCursor(cursorX, cursorY);
                }
            } else if (c == '\n') {
                cursorX = 0;
                cursorY += 8;
                ILI9341_setCursor(cursorX, cursorY);
                if (cursorY >= 320) {
                    cursorY = 0;
                    ILI9341_fillScreen(ILI9341_BLACK);
                    ILI9341_setCursor(0, 0);
                }
            }
        }

        sectorInCluster++;
        if (sectorInCluster >= g_sectorsPerCluster) {
            sectorInCluster = 0;
            nextCluster = FAT12_GetFatEntry(currentCluster);
            if (nextCluster >= 0x0FF8 || nextCluster == 0) {
                printf("TXT: EOF cluster\r\n");
                break;
            }
            currentCluster = nextCluster;
        }

        if (bytesRead % 512 == 0) {
            printf("TXT: %lu/%lu bytes\r\n", bytesRead, fileSize);
        }
    }

    printf("\r\n========================================\r\n");
    //printf("TXT: Done %lu bytes\r\n", bytesRead);
    return 0;
}

uint8_t TXT_ListFiles(void) {
    uint8_t buffer[512];
    uint32_t rootDirSectors;
    uint32_t i, j;
    int fileCount = 0;

    printf("\r\n=== Files ===\r\n");

    uint32_t dummy1, dummy2, dummy3, dummy4, dummy5, dummy6;
    if (FAT12_ReadBootSector(&dummy1, &dummy2, &dummy3, &dummy4, &dummy5, &dummy6) != 0) {
        printf("TXT: boot err\r\n");
        return 1;
    }

    rootDirSectors = ((g_rootEntries * 32) + (g_bytesPerSector - 1)) / g_bytesPerSector;

    for (i = 0; i < rootDirSectors; i++) {
        if (SD_ReadDisk(buffer, g_rootSector + i, 1) != 0) {
            printf("TXT: root err\r\n");
            continue;
        }

        for (j = 0; j < 16; j++) {
            uint8_t* entry = &buffer[j * 32];

            if (entry[0] == 0x00) {
                printf("Total: %d files\r\n", fileCount);
                return 0;
            }
            if (entry[0] == 0xE5) continue;
            if (entry[11] == 0x0F) continue;
            if (entry[11] & 0x08) continue;

            printf("  ");
            for (int k = 0; k < 8; k++) {
                if (entry[k] >= 32 && entry[k] <= 126) printf("%c", entry[k]);
            }
            if (entry[8] != ' ') {
                printf(".");
                for (int k = 8; k < 11; k++) {
                    if (entry[k] >= 32 && entry[k] <= 126) printf("%c", entry[k]);
                }
            }

            uint32_t size = entry[28] | (entry[29] << 8) | (entry[30] << 16) | (entry[31] << 24);
            printf(" - %lu bytes\r\n", size);

            fileCount++;
        }
    }

    printf("Total: %d files\r\n", fileCount);
    return 0;
}
```


需要源代码请私信，可以打包整个工程。
