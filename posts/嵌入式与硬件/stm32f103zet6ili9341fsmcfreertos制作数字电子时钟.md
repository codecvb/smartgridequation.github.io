---
title: stm32f103zet6ili9341fsmcfreertos制作数字电子时钟
slug: stm32f103zet6ili9341fsmcfreertos制作数字电子时钟
category: 嵌入式与硬件
summary: 配置教程请参考 STM32F103ZET6 FREERTOS 双UART 多任务多串口输出（配置教程）
tags: 嵌入式, 物联网
---

配置教程请参考 [STM32F103ZET6 FREERTOS 双UART 多任务多串口输出（配置教程）](https://blog.csdn.net/SmartGridequation/article/details/142903700?spm=1001.2014.3001.5501 "STM32F103ZET6 FREERTOS 双UART 多任务多串口输出（配置教程）")


主函数和配置和该教程一模一样，不需要添加什么变动


唯一需要添加的是 在freertos.c 的 void StartTask02(void const \* argument)中写如下代码


```cpp
/* USER CODE BEGIN Header_StartTask02 */
/**
* @brief Function implementing the myTask02 thread.
* @param argument: Not used
* @retval None
*/
/* USER CODE END Header_StartTask02 */
void StartTask02(void const * argument)
{
  /* USER CODE BEGIN StartTask02 */
	char date_time[] = "2024-10-23 12:59:59";
	char str[30];
	int year = 2024;
	int month = 10;
	int date = 23;
	int hour = 12;
	int minute = 59;
	int second = 59;
	char month_t[3];
	char date_t[3];
	char hour_t[3];
	char minute_t[3];
	char second_t[3];

  /* Infinite loop */
  for(;;)
  {
    osDelay(996);
		second++;
		if(second == 60){
			second = 0;
			minute++;
			if(minute==60){
				minute = 0;
				hour++;
				if(hour==25){
					hour = 0;
					date++;
					if(month == 1||month == 3||month == 5||month == 7||month == 8||month == 10||month == 12){
						if(date == 32){
							date = 0;
							month++;
							if(month == 13){
								year++;
								month = 1;
							}
						}
					}
					else if(month == 2){
						if(date == 29){
							date = 0;
							month++;
							if(month == 13){
								year++;
								month = 1;
							}
						}
					}
					else{
						if(date == 31){
							date = 0;
							month++;
							if(month == 13){
								year++;
								month = 1;
							}
						}
					}
				}
			}
		}
		if(date<10){
			sprintf(date_t,"0%d",date);
		}
		else{
			sprintf(date_t,"%d",date);
		}
		if(month<10){
			sprintf(month_t,"0%d",month);
		}
		else{
			sprintf(month_t,"%d",month);
		}
		if(hour<10){
			sprintf(hour_t,"0%d",hour);
		}
		else{
			sprintf(hour_t,"%d",hour);
		}
		if(minute<10){
			sprintf(minute_t,"0%d",minute);
		}
		else{
			sprintf(minute_t,"%d",minute);
		}
		if(second<10){
			sprintf(second_t,"0%d",second);
		}
		else{
			sprintf(second_t,"%d",second);
		}
		//if(month<10||date<10||hour<10||minute<10||second<10){
		//	sprintf(str,"%d - %d - %d %d : %d : %d",year,month,date,hour,minute,second);
		//}

		sprintf(str,"%d - %s - %s %s : %s : %s",year,month_t,date_t,hour_t,minute_t,second_t);

		//LCD_Clear(BLUE); 为了每次输出不会有上一次输出字符的残留,不过画面会有闪烁，看起来有些异样

		LCD_ShowString(40,150,360,32,16,(uint8_t*)str);

  }
  /* USER CODE END StartTask02 */
}
```


效果如下:


![](/uploads/csdn/stm32f103zet6ili9341fsmcfreertos制作数字电子时钟/img-01.gif)


有什么问题可以留言或者私信沟通，需要代码文件请告知我
