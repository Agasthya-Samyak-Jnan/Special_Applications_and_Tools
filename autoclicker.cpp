#include<windows.h>
#include<iostream>
#include<bits/stdc++.h>

using namespace std;

int main () {

    while (1) {
           //Check for Key Press using GetAsyncKeyState(hexadecimal of key you want to detect)
           //returns true only if specified key is pressed , else false
           // "mouse_event" function simulates mouse click button press

           if (GetAsyncKeyState(0x41)) {
              mouse_event(MOUSEEVENTF_LEFTDOWN,MOUSEEVENTF_ABSOLUTE,MOUSEEVENTF_ABSOLUTE,0,GetMessageExtraInfo());
              mouse_event(MOUSEEVENTF_LEFTUP,MOUSEEVENTF_ABSOLUTE,MOUSEEVENTF_ABSOLUTE,0,GetMessageExtraInfo());
           }

           //Use "Sleep(miliseconds)" function to control the key simulation speed

           Sleep(30);

           //To Stop This Demon, press <SPACE>

           if (GetAsyncKeyState(VK_SPACE)) {
            return 0;
           }  
                 
    }
}
         