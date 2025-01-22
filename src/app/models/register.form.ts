import { FormControl } from "@angular/forms";

export interface RegisterForm {
    nome: FormControl;
    email: FormControl;
    confirmEmail: FormControl;
    password: FormControl;
    confirmPassword: FormControl;
    userNickName: FormControl;
}