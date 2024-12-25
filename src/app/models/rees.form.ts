import { FormControl } from "@angular/forms";

export interface ReesForm {
    codMateria: FormControl;
    conteudo: FormControl;
    conteudoTexto: FormControl;
    descricao: FormControl;
    isNovoConteudo: FormControl;
}