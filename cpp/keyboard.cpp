#include <iostream>
#include <thread>
#include <chrono>


#ifdef _WIN32
#include <windows.h>
#endif

#ifdef __APPLE__
#include <ApplicationServices/ApplicationServices.h>
#endif

int main() {
    std::this_thread::sleep_for(std::chrono::milliseconds(150));
    
#ifdef __linux__
    // Simulate Ctrl+V on Linux using xdotool library
    std::string command = "xdotool key ctrl+v";
    std::system(command.c_str());
#endif

#ifdef _WIN32
    // Simulate Ctrl+V on Windows using SendInput function
    INPUT input;
    input.type = INPUT_KEYBOARD;
    input.ki.wVk = VK_CONTROL;
    input.ki.dwFlags = 0;
    SendInput(1, &input, sizeof(INPUT));

    input.ki.wVk = 'V';
    input.ki.dwFlags = 0;
    SendInput(1, &input, sizeof(INPUT));

    input.ki.wVk = 'V';
    input.ki.dwFlags = KEYEVENTF_KEYUP;
    SendInput(1, &input, sizeof(INPUT));

    input.ki.wVk = VK_CONTROL;
    input.ki.dwFlags = KEYEVENTF_KEYUP;
    SendInput(1, &input, sizeof(INPUT));
#endif

#ifdef __APPLE__
    // Simulate Ctrl+V on macOS using CGEventPost function
    CGEventRef event = CGEventCreateKeyboardEvent(NULL, (CGKeyCode)9, true);
    CGEventPost(kCGHIDEventTap, event);
    CFRelease(event);

    event = CGEventCreateKeyboardEvent(NULL, (CGKeyCode)9, false);
    CGEventPost(kCGHIDEventTap, event);
    CFRelease(event);
#endif

    return 0;
}
