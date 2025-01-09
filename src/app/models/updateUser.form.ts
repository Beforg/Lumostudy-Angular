import { FormControl } from "@angular/forms";

export interface UpdateUserForm {
    type: FormControl;
    value: FormControl;
    password: FormControl;
}