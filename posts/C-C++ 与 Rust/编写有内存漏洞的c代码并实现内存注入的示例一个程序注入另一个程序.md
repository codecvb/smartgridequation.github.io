---
title: 编写有内存漏洞的C代码并实现内存注入的示例一个程序注入另一个程序
slug: 编写有内存漏洞的c代码并实现内存注入的示例一个程序注入另一个程序
category: C/C++ 与 Rust
summary: 实现思路
tags: C/C++, Rust, C
---

#### 实现思路


在 Windows 平台下，可以使用 Windows API 编写一个程序来对另一个目标程序进行内存注入。基本步骤如下：


1.  **查找目标进程**：通过进程名找到目标进程的 ID。
2.  **打开目标进程**：使用 `OpenProcess` 函数打开目标进程，获取进程句柄。
3.  **在目标进程中分配内存**：使用 `VirtualAllocEx` 函数在目标进程的地址空间中分配一块内存。
4.  **将数据写入目标进程的内存**：使用 `WriteProcessMemory` 函数将数据写入到目标进程分配的内存中。
5.  **执行注入的代码（可选）**：可以使用 `CreateRemoteThread` 函数在目标进程中创建一个新的线程来执行注入的代码。


#### 示例代码


##### 目标程序（被注入的程序）


```cpp
#include <iostream>
#include <windows.h>

int main() {
    int value = 10;
    std::cout << "Original value: " << value << std::endl;
    while (true) {
        Sleep(1000);
    }
    return 0;
}
```


##### 注入程序


```cpp
#include <iostream>
#undef   UNICODE
#include <windows.h>
#include <tlhelp32.h>

// 通过进程名获取进程 ID
DWORD GetProcessId(const char* processName) {
	PROCESSENTRY32 processEntry;
	processEntry.dwSize = sizeof(PROCESSENTRY32);

	HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, NULL);
	if (snapshot == INVALID_HANDLE_VALUE) {
		return 0;
	}

	if (Process32First(snapshot, &processEntry)) {
		do {
			if (strcmp(processEntry.szExeFile, processName) == 0) {
				CloseHandle(snapshot);
				return processEntry.th32ProcessID;
			}
		} while (Process32Next(snapshot, &processEntry));
	}

	CloseHandle(snapshot);
	return 0;
}

int main() {
	const char* targetProcessName = "Project1.exe";  // 目标程序的可执行文件名
	DWORD targetProcessId = GetProcessId(targetProcessName);
	if (targetProcessId == 0) {
		std::cout << "Target process not found." << std::endl;
		return 1;
	}

	// 打开目标进程
	HANDLE targetProcessHandle = OpenProcess(PROCESS_ALL_ACCESS, FALSE, targetProcessId);
	if (targetProcessHandle == NULL) {
		std::cout << "Failed to open target process." << std::endl;
		return 1;
	}

	// 在目标进程中分配内存
	int newValue = 20;
	SIZE_T bytesToWrite = sizeof(newValue);
	LPVOID remoteAddress = VirtualAllocEx(targetProcessHandle, NULL, bytesToWrite, MEM_COMMIT, PAGE_READWRITE);
	if (remoteAddress == NULL) {
		std::cout << "Failed to allocate memory in target process." << std::endl;
		CloseHandle(targetProcessHandle);
		return 1;
	}

	// 将数据写入目标进程的内存
	BOOL writeResult = WriteProcessMemory(targetProcessHandle, remoteAddress, &newValue, bytesToWrite, NULL);
	if (!writeResult) {
		std::cout << "Failed to write memory in target process." << std::endl;
		VirtualFreeEx(targetProcessHandle, remoteAddress, 0, MEM_RELEASE);
		CloseHandle(targetProcessHandle);
		return 1;
	}

	std::cout << "Memory injection successful." << std::endl;

	// 假设我们知道 value 变量在目标进程中的地址，这里只是示例地址，实际需要调试获取
	LPVOID targetAddress = remoteAddress; // 替换为实际地址

	int readValue;
	SIZE_T bytesRead;
	BOOL readResult = ReadProcessMemory(targetProcessHandle, targetAddress, &readValue, sizeof(readValue), &bytesRead);
	if (readResult) {
		std::cout << "Value read from target process: " << readValue << std::endl;
	}
	else {
		std::cout << "Failed to read memory from target process." << std::endl;
	}

	// 释放资源
	VirtualFreeEx(targetProcessHandle, remoteAddress, 0, MEM_RELEASE);
	CloseHandle(targetProcessHandle);

	return 0;
}
```


#### 代码解释


1.  **`GetProcessId` 函数**：通过进程名查找目标进程的 ID。使用 `CreateToolhelp32Snapshot` 函数创建一个系统进程快照，然后遍历快照中的所有进程，找到与指定进程名匹配的进程，并返回其 ID。
2.  **`main` 函数**：
    -   调用 `GetProcessId` 函数获取目标进程的 ID。
    -   使用 `OpenProcess` 函数打开目标进程，获取进程句柄。
    -   使用 `VirtualAllocEx` 函数在目标进程的地址空间中分配一块内存。
    -   使用 `WriteProcessMemory` 函数将新值 `20` 写入到目标进程分配的内存中。
    -   最后释放分配的内存并关闭进程句柄。


#### 现象和结果


-   **现象**：注入程序成功运行后，会在目标进程的地址空间中分配一块内存，并将新值 `20` 写入该内存。
-   **结果**：由于目标程序没有主动读取注入的内存，所以在目标程序的控制台窗口中看不到明显的变化。但可以使用调试器（如 Visual Studio 调试器）来查看目标进程的内存，验证注入的内存是否包含新值 `20`。


#### 注意事项


-   这种内存注入方法需要管理员权限才能正常运行，因为需要访问其他进程的内存。
-   内存注入应该仅在合法的调试和测试环境中使用，不要用于非法目的。
-   效果如下
-   ![](/uploads/csdn/编写有内存漏洞的c代码并实现内存注入的示例一个程序注入另一个程序/img-01.png)
