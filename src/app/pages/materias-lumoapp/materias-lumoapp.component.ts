import { Component } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { CommonModule } from '@angular/common';
import { InputComponent } from "../../shared/input/input.component";
import { Materia } from '../../models/materia';
import { MateriaService } from '../../service/materia.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CadastrarMateriaForm } from '../../models/cadastrar.materia.form';
import { ButtonComponent } from "../../shared/button/button.component";

@Component({
  selector: 'app-materias-lumoapp',
  standalone: true,
  imports: [
    HeaderLumoappComponent, 
    MenuLumoappComponent,
    CommonModule, InputComponent, 
    ReactiveFormsModule,
    ButtonComponent,],
  providers: [MateriaService],
  templateUrl: './materias-lumoapp.component.html',
  styleUrl: './materias-lumoapp.component.css'
})
export class MateriasLumoappComponent {
  materiasForm!: FormGroup<CadastrarMateriaForm>;
  isMateriaAtivo: boolean = true;
  isNovaMateriaAtivo: boolean = false;
  isNovaCategoria: boolean = false;
  isEdicaoAtivo: boolean = false;
  isExclusaoAtivo: boolean = false;
  materias: Materia[] = [];
  categoriasMaterias: { value: string, label: string }[] = [];
  edit: string = '/app/edit.png';
  x: string = '/app/x.png';
  codMateriaSelecionada!: string;
  pag: number = 1;
  pagItems: number = 0;
  showPagination = true;

  constructor(private service: MateriaService, private toastr: ToastrService) {
    this.atualizarMateriaEcategoria();
    this.materiasForm = new FormGroup<CadastrarMateriaForm>({
      nome: new FormControl('', Validators.required),
      categoria: new FormControl('', Validators.required),
      categoriaTexto: new FormControl(''),
      novaCategoria: new FormControl(false)
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


  atualizarMateriaEcategoria() {
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
      console.log(this.pag)
      this.pagItems = 0;

    } 
  }

  previousPage(): void {
    if (this.pag > 1) {
      this.pag--;
      this.atualizarMateriaEcategoria();
      console.log(this.pag)
    } 
  }

  abrirModalEditarMateria(materia: Materia) {
    this.materiasForm.get('novaCategoria')?.setValue(false);
    this.isEdicaoAtivo = true;
    this.materiasForm.get('nome')?.setValue(materia.nome);
    this.materiasForm.get('categoria')?.setValue(materia.categoria);
    this.codMateriaSelecionada = materia.cod;

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
        this.toastr.success('Matéria atualizada com sucesso!');
        this.materiasForm.reset();
        this.atualizarMateriaEcategoria();

        this.isEdicaoAtivo = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar matéria.', error);
        this.toastr.error('Erro ao atualizar matéria.');
      }
    });
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
