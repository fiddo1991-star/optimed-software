#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#NoEnv
#SingleInstance Force
SendMode Input
SetTitleMatchMode, 2

; -------------------------------
; F2 = Start Dictation + Focus Chrome
; -------------------------------
F2::
IfWinExist, dictation.io/speech
{
    WinActivate
}
else
{
    Run, https://dictation.io/speech
    Sleep, 3000
}

; Click microphone button (approx position)
Click, 300, 300
return


; -------------------------------
; F3 = Copy + Paste into MedAssist Clinic Software
; -------------------------------
F3::
Send, ^a
Sleep, 100
Send, ^c
Sleep, 100

IfWinExist, MedAssist Clinic Software
{
    WinActivate
    Sleep, 200
    Send, ^v
}
return