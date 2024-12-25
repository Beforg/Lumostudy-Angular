import { FormControl } from "@angular/forms";

export interface PomodoroConfiguration {
    timer: FormControl;
    shortBreak: FormControl;
    longBreak: FormControl;
    cycles: FormControl;
}