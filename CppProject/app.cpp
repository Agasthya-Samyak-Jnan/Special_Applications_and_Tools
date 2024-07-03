#define UNICODE
#define WIN32_LEAN_AND_MEAN
#include<bits/stdc++.h>
#include <windows.h>
#include<winuser.h>
#include "logics.hpp"

Parser parser;
Logic logic;

class My_Window {

public:
    HWND hwnd;
    WNDCLASS wd;

    My_Window(HINSTANCE hinstance, int ncmdshow) {

        // Define Technical things for Window
        wd = { };
        wd.hInstance = hinstance;
        wd.lpfnWndProc = WndProc;
        wd.lpszClassName = L"MyWindow";
        wd.hbrBackground = CreateSolidBrush(RGB(50,50,50)); // Brush for Painting on Window Continuously. (Smooth Rendering)

        // Register Window to OS
        if (!RegisterClass(&wd)) { MessageBox(NULL, L"Window registration failed!", L"Error", MB_ICONERROR); return; }

        // Create Window and Get its Process Handle
        hwnd = CreateWindow(wd.lpszClassName, L"Calculator", WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, 550, 600, NULL, NULL, hinstance, NULL);
        if (hwnd == NULL) { MessageBox(NULL, L"Window creation failed!", L"Error", MB_ICONERROR); return; }

        ShowWindow(hwnd, ncmdshow);
        UpdateWindow(hwnd);
    }

    // The "Window Procedure" Function that performs various procedures on Window such as Rendering, Closing, Destroying Window etc.
    static LRESULT __stdcall WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
        
        static HWND exp_box, ans_box, history_box;
        std::vector<std::wstring> buttonz = { L"(", L")", L"C", L"=", L"1", L"2", L"3", L"+", L"4", L"5",
                                              L"6", L"-", L"7", L"8", L"9", L"*", L".", L"0", L"^", L"/", 
                                              L"Sin", L"Cos", L"Tan", L"Sqrt", L"Log", L"ln" , L"Exp" , L"MC" };
        wchar_t currentText[1024];
        wchar_t tempbuffer[4096];
        
        // Check message "msg" and do appropriate action
        switch (msg) {
            // BUTTON AND OTHER ELEMENTS RENDERING LOGIC PART
            case WM_CREATE: {
                int x=0, y=0; 
                for (int i=0;i<buttonz.size();i++) {
                    HWND hwndButton = CreateWindow(L"BUTTON",buttonz[i].c_str(),WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON | BS_OWNERDRAW ,25+x*60,100+y*60,50,50,hwnd,(HMENU)(i+1),(HINSTANCE)GetWindowLongPtr(hwnd,GWLP_HINSTANCE),NULL);
                    x++; if ((i+1)%4==0) { y++; x=0; }
                    if (!hwndButton) { MessageBox(hwnd,L"Button Creation Failed",L"Error",MB_ICONERROR); }
                }
                // Answer and Expression Box Renderer
                exp_box = CreateWindow(L"EDIT",NULL, WS_CHILD | WS_VISIBLE | ES_LEFT ,25,25,230,32,hwnd,(HMENU)10,(HINSTANCE)GetWindowLongPtr(hwnd, GWLP_HINSTANCE),NULL);
                ans_box = CreateWindow(L"EDIT",NULL, WS_CHILD | WS_VISIBLE | ES_LEFT ,25,60,230,32,hwnd,(HMENU)10,(HINSTANCE)GetWindowLongPtr(hwnd, GWLP_HINSTANCE),NULL);
                history_box = CreateWindow(L"EDIT",NULL, WS_VSCROLL | ES_MULTILINE | ES_AUTOVSCROLL | WS_CHILD | WS_VISIBLE | WS_BORDER | ES_LEFT,275,25,230,490,hwnd,(HMENU)10,(HINSTANCE)GetWindowLongPtr(hwnd, GWLP_HINSTANCE),NULL);
                if (!exp_box || !ans_box) { MessageBox(hwnd,L"Box Creation Failed",L"Error",MB_ICONERROR); }
                HFONT hFont = CreateFont(20, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET, OUT_OUTLINE_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, VARIABLE_PITCH, TEXT("Segoe UI"));
                SendMessage(exp_box, WM_SETFONT, (WPARAM)hFont, TRUE);
                SendMessage(ans_box, WM_SETFONT, (WPARAM)hFont, TRUE);
                SendMessage(history_box, WM_SETFONT, (WPARAM)hFont, TRUE);
                break;
            }
            // BUTTON AND ELEMENTS INTERACTION LOGIC PART
            case WM_COMMAND: {
                int buttonID = wParam;  // Get Info on "Which Button is pressed" (DO NOT DO LOWORD FOR GOD'S SAKE PLS)
                switch (wParam) {
                    case 1: case 2: case 12: case 11: case 5: case 6:
                    case 7: case 8: case 9: case 10: case 13: case 14: 
                    case 15: case 16: case 17: case 18: case 19: case 20:
                    case 21: case 22: case 23: case 24: case 25: case 26: case 27: {
                        const wchar_t* buttonText = buttonz[buttonID - 1].c_str();  
                        GetWindowText(exp_box, currentText, 256);
                        wcscat(currentText, buttonText);
                        SetWindowText(exp_box, currentText);
                        break;
                    }
                    case 4: { // get_Answer Key '='
                        // Get Expression from window
                        GetWindowText(exp_box,currentText,1024);
                        
                        // Convert Expression from Unicode to ASCII String
                        std::wstring _wexp(currentText);
                        std::string __exp(_wexp.begin(),_wexp.end());
                        
                        // Evaluate the Expression
                        parser.parse_Exp(__exp);
                        parser.infix_To_Postfix();
                        std::string answer = std::to_string(logic.evalpostfix(&parser)); // Convert Answer to String
                        
                        // Convert ASCII String to Unicode
                        std::wstring __ans = std::wstring(answer.begin(),answer.end());
                        
                        // Clear Previous Answer
                        SetWindowText(ans_box, L"");
                        
                        // Set New Answer
                        SetWindowText(ans_box, __ans.c_str());
                        
                        /// Prepare the history text
                        std::wstring historyText;
                        GetWindowText(history_box, tempbuffer, 4096);
                        // Append the current operation and result to history
                        historyText = currentText;
                        historyText += L" = ";
                        historyText += __ans;
                        historyText += L"\r\n";           
                        // Append new operation with newline character to contents of History box
                        SetWindowText(history_box, (tempbuffer + historyText).c_str());
                        // Clear Calculator Objects to avoid Mistakes
                        parser.clear();
                        logic.clear();
                        break;
                    }
                    case 3: { // Clear_All  Key
                        memset(currentText,0,sizeof(currentText));
                        SetWindowText(exp_box,currentText);
                        SetWindowText(ans_box,currentText);
                        break;
                    } 
                    case 28 : { // Clear_History Key
                         memset(tempbuffer,0,sizeof(tempbuffer));
                         SetWindowText(history_box,L"");
                         break;
                    }
                    default: break;
                }
                break;
            }
            case WM_DRAWITEM: {
                LPDRAWITEMSTRUCT pdis = (LPDRAWITEMSTRUCT)lParam;
                if (pdis->CtlType == ODT_BUTTON) {
                    HDC hdc = pdis->hDC;
                    RECT rect = pdis->rcItem;
                    SetBkColor(hdc, RGB(70, 80, 80));
                    SetTextColor(hdc, RGB(22, 232, 232));
                    HBRUSH hBrush = CreateSolidBrush(RGB(70, 80, 80));
                    HBRUSH oldBrush = (HBRUSH)SelectObject(hdc, hBrush);
       
                    // Draw rounded rectangle
                    RoundRect(hdc, rect.left, rect.top, rect.right, rect.bottom, 20, 20);

                    // Draw button text
                    std::wstring buttonText;
                    for (auto& btn : buttonz) {
                        if (pdis->CtlID == (int)(&btn - &buttonz[0] + 1)) {
                            buttonText = btn;
                            break;
                        }
                    }
                    DrawText(hdc, buttonText.c_str(), -1, &rect, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

                    // Cleanup
                    SelectObject(hdc, oldBrush);
                    DeleteObject(hBrush);
                    return TRUE;
                }
                break;
            }
            case WM_DESTROY: { PostQuitMessage(0); break; }
            case WM_CLOSE: { DestroyWindow(hwnd); break; }
            default: return DefWindowProc(hwnd, msg, wParam, lParam);
        }
        return 0;
    }

    int RunMessageLoop() {
        MSG msg = { };
        while (GetMessage(&msg, NULL, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
        return static_cast<int>(msg.wParam);
    }
};

int WINAPI WinMain(HINSTANCE hinstance, HINSTANCE hprevinstance, LPSTR lpCmdLine, int ncmdshow) {
    My_Window* wnd = new My_Window(hinstance, ncmdshow);
    return wnd->RunMessageLoop();
}

// int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
//     MessageBoxA(NULL, "Hello, World!", "Hello", MB_OK);
//     return 0;
// }
