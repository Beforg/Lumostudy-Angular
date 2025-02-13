import { Component } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { CommonModule } from '@angular/common';
import { InputComponent } from "../../shared/input/input.component";
import { Materia } from '../../models/materia';
import { MateriaService } from '../../service/materia.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, NgControl, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { CadastrarMateriaForm } from '../../models/cadastrar.materia.form';
import { ButtonComponent } from "../../shared/button/button.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { ReesService } from '../../service/rees.service';
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-materias-lumoapp',
  standalone: true,
  imports: [
    HeaderLumoappComponent,
    MenuLumoappComponent,
    CommonModule, InputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    FormsModule,
    FooterComponent
],
  providers: [MateriaService, ReesService],
  animations: [
    trigger('fadeInOut', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('300ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
            animate('300ms', style({ opacity: 0 }))
        ])
    ])
],
  templateUrl: './materias-lumoapp.component.html',
  styleUrl: './materias-lumoapp.component.css'
})
export class MateriasLumoappComponent {
  materiasForm!: FormGroup<CadastrarMateriaForm>;
  materias: Materia[] = [];
  conteudo!: { value: string, label: string }[];
  conteudoSelecionado: string = '';
  conteudoNovo!: string;

  isMateriaAtivo: boolean = true;
  isNovaMateriaAtivo: boolean = false;
  isNovaCategoria: boolean = false;
  isEdicaoAtivo: boolean = false;
  isExclusaoAtivo: boolean = false;
  isEditarConteudoAtivo: boolean = false;
  showPagination:boolean = true;

  materiabg: string = '/app/materias-bg.png';
  icoMateria: string = '/app/materia.png';  
  categoriasMaterias: { value: string, label: string }[] = [];
  edit: string = '/app/edit.png';
  x: string = '/app/x.png';
  codMateriaSelecionada!: string;

  pag: number = 1;
  pagItems: number = 0;



  constructor(private service: MateriaService, private toastr: ToastrService, private reesService: ReesService) {
    this.atualizarMateriaEcategoria();
    this.materiasForm = new FormGroup<CadastrarMateriaForm>({
      nome: new FormControl('', Validators.required),
      categoria: new FormControl('', Validators.required),
      categoriaTexto: new FormControl(''),
      novaCategoria: new FormControl(false),
      conteudoNovo: new FormControl(''),
    })
    this.materiasForm.get('novaCategoria')?.valueChanges.subscribe((value) => {
      if (value) {
        this.materiasForm.get('categoria')?.clearValidators();
        this.materiasForm.get('categoriaTexto')?.setValidators([Validators.required]);
      } else {
        this.materiasForm.get('categoriaTexto')?.clearValidators();
        this.materiasForm.get('categoria')?.setValidators([Validators.required]);
      }
      this.materiasForm.get('categoria')?.updateValueAndValidity();
      this.materiasForm.get('categoriaTexto')?.updateValueAndValidity();
    })
  }


  onConteudoChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.conteudoSelecionado = inputElement.value;
    console.log('Conteúdo selecionado:', this.conteudoSelecionado);
  }

  atualizarMateriaEcategoria() { // carrega de acordo com a página
    this.materias = [];
    this.categoriasMaterias = [];
    this.service.getMateriasPaginadas(this.pag - 1).subscribe((data: Materia[]) => {
      this.materias = data;
      console.log(this.materias)
      this.pagItems = this.materias.length;
    });
    this.service.getCategorias().subscribe((data: string[]) => {
      this.categoriasMaterias.push({ value: '', label: 'Selecione a Categoria' });
      data.forEach((categoria) => {
        this.categoriasMaterias.push({ value: categoria, label: categoria });
      });
    });
  }

  nextPage(): void {

    if (this.pagItems == 6) {
      this.pag++;
      this.atualizarMateriaEcategoria();
      this.pagItems = 0;

    } 
  }

  previousPage(): void {
    if (this.pag > 1) {
      this.pag--;
      this.atualizarMateriaEcategoria();
    } 
  }

  ativarEdicaoConteudo(): void {
    if (this.conteudoSelecionado == '') {
      this.toastr.warning('Selecione um conteúdo para editar.');
      return;
    }
    this.isEditarConteudoAtivo = !this.isEditarConteudoAtivo;
  }

  abrirModalEditarMateria(materia: Materia) {
    this.materiasForm.get('novaCategoria')?.setValue(false);
    this.isEdicaoAtivo = true;
    this.materiasForm.get('nome')?.setValue(materia.nome);
    this.materiasForm.get('categoria')?.setValue(materia.categoria);
    this.codMateriaSelecionada = materia.cod;
    this.listarConteudos(this.codMateriaSelecionada);

  }

  listarConteudos(codMateria: string) {
    this.reesService.listarConteudo(codMateria).subscribe((conteudo: string[]) => {
      this.conteudo = [{ value: '', label: 'Selecione o Conteúdo' }, ...conteudo.map(c => ({
        value: c,
        label: c
      }))];
    });
  }

  abrirModalExcluirMateria(materia: Materia) {
    this.materiasForm.get('novaCategoria')?.setValue(false);
    this.isExclusaoAtivo = true;
    this.codMateriaSelecionada = materia.cod;
    this.materiasForm.get('categoria')?.setValue(materia.nome);
  }

  fecharEdicao(): void {
    this.isEdicaoAtivo = false;
    this.materiasForm.reset();
  }

  fecharExclusao(): void {
    this.isExclusaoAtivo = false;
  }

  editarMateria(): void {
    if (this.materiasForm.invalid) {
      this.toastr.error('Preencha todos os campos corretamente.');
      return;
    }
    this.service.atualizarMateria(
      this.materiasForm.get('nome')?.value,
      this.materiasForm.get('categoria')?.value,
      this.codMateriaSelecionada
    ).subscribe({
      next: () => {
        this.toastr.success('Dados da matéria atualizados com sucesso!');
        this.materiasForm.reset();
        this.atualizarMateriaEcategoria();

        this.isEdicaoAtivo = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar matéria.', error);
        this.toastr.error('Erro ao atualizar matéria.');
      }
    
    });
    console.log(this.isEditarConteudoAtivo);
    if (this.isEditarConteudoAtivo) {
      if (this.materiasForm.get('conteudoNovo')?.value !== '') {
        this.toastr.error('O conteúdo não pode ficar vazio!');
        return;
      }
      console.log(this.isEditarConteudoAtivo && this.materiasForm.get('conteudoNovo')?.value !== '');
      this.reesService.editarConteudo(this.codMateriaSelecionada, this.conteudoSelecionado, this.materiasForm.get('conteudoNovo')?.value).subscribe({
        next: () => {
          this.materiasForm.reset();
          this.isEditarConteudoAtivo = false;
          console.log('Conteúdo editado');
        },
        error: (error) => {
          console.error('Erro ao editar conteúdo.', error);
        }
      });
    }
  }

  excluirMateria() {
    if (this.materiasForm.get('nome')?.value != this.materiasForm.get('categoria')?.value) {
      this.toastr.error('Nome da matéria não confere com o nome da matéria selecionada.');
      return;
    }
    this.service.excluirMateria(this.codMateriaSelecionada).subscribe({
      next: () => {
        this.toastr.success('Matéria excluída com sucesso!');
        this.atualizarMateriaEcategoria();
        this.isExclusaoAtivo = false;
        this.materiasForm.reset();
      },
      error: (error) => {
        console.error('Erro ao excluir matéria.', error);
        this.toastr.error('Erro ao excluir matéria.');
      }
    });
  }

  cadastrarMateria(): void {
    if (this.materiasForm.invalid) {
      this.toastr.error('Preencha todos os campos corretamente.');
      return;
    }

    if (this.materiasForm.get('categoria')?.value == '' && this.materiasForm.get('novaCategoria')?.value == false)  {
      this.toastr.error('Selecione uma categoria ou crie uma nova.');
      return;
    }
    
    const materia = {
      nome: this.materiasForm.get('nome')?.value,
      categoria: this.materiasForm.get('categoria')?.value == '' ? this.materiasForm.get('categoriaTexto')?.value : this.materiasForm.get('categoria')?.value,
      cod: "",
      estudosRegistrados: 0
    }
    this.service.cadastrarMateria(materia).subscribe({
      next: () => {
        this.toastr.success('Matéria cadastrada com sucesso!');
        this.atualizarMateriaEcategoria();
        this.isNovaCategoria = false;
        this.materiasForm.reset();
      },
      error: (error) => {
        this.toastr.error('Erro interno ao cadastrar matéria, tente novamente mais tarde.');
      }
    });

  }

  alterarAba(): void {
    if (this.isMateriaAtivo) {
      this.isMateriaAtivo = false;
      this.isNovaMateriaAtivo = true;
      this.showPagination = false;
    } else {
      this.isMateriaAtivo = true;
      this.isNovaMateriaAtivo = false;
      this.showPagination = true;
    }
  }

  alterarCategoria(): void {
    if (this.isNovaCategoria) {
      this.isNovaCategoria = false;
    } else {
      this.isNovaCategoria = true;
    }
    
  }

}
