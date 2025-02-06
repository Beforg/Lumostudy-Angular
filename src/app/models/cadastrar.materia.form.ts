import { FormControl } from "@angular/forms";

export interface CadastrarMateriaForm {
    nome: FormControl;
    categoria: FormControl;
    categoriaTexto: FormControl;
    novaCategoria: FormControl;
    conteudoNovo: FormControl;
}