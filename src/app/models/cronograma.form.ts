import { FormControl } from "@angular/forms";

export interface CronogramaForm {
    data: FormControl;
    conteudo: FormControl;
    descricao: FormControl;
    materiaCod: FormControl;
    isNovoConteudo: FormControl;
    conteudoNovo: FormControl;
}