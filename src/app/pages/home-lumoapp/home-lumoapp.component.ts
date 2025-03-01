import { Component, NgModule, OnInit } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { AuthService } from '../../service/auth.service';
import { InputComponent } from "../../shared/input/input.component";
import { Cronograma } from '../../models/cronograma';
import { CommonModule } from '@angular/common';
import { CronogramaService } from '../../service/cronograma.service';
import { ToastrService } from 'ngx-toastr';
import { ReesService } from '../../service/rees.service';
import { FormsModule, NgModel } from '@angular/forms';
import { Rees } from '../../models/rees';
import { TransformaTempo } from '../../utils/transforma-tempo';
import { FooterComponent } from "../../components/footer/footer.component";
import { CardComponent } from "../../components/card/card.component";
import { NavComponent } from "../../components/nav/nav.component";
import { CardDoneComponent } from "../../components/card-done/card-done.component";

@Component({
  selector: 'app-home-lumoapp',
  standalone: true,
  imports: [HeaderLumoappComponent, MenuLumoappComponent, InputComponent, CommonModule, FormsModule, FooterComponent, CardComponent, NavComponent, CardDoneComponent],
  providers: [AuthService, CronogramaService, ReesService],
  templateUrl: './home-lumoapp.component.html',
  styleUrl: './home-lumoapp.component.css'
})
export class HomeLumoappComponent implements OnInit {
  nome: string | undefined;
  itensCronograma!: Cronograma[];
  qtdTotalItensCronograma: number = 0;
  qtdeItensRegistroEstudo: number = 0;
  tempoDeEstudo: number = 0;
  tempoDeEstudoFormatado!: string;
  registrosEstudo!: Rees[];
  qtdeItensCronograma: number = 0;
  page = 1;
  pageRegistros = 1;
  data: string;
  constructor(private auth: AuthService, private cronogramaService: CronogramaService, private toastr: ToastrService, private reesService: ReesService) {
    this.nome = this.auth.getUsuarioAtual()?.getNome();
    console.log(this.auth.getUsuarioAtual());
    const today = new Date();
    this.data = today.toISOString().split('T')[0];
  }


  ngOnInit(): void {
    // this.getTotalItensCronograma();
    // this.getCronogramaDoDia();
    // this.getEstudosRealizadosDoDia()
    this.atualizarComponente();
  }


  concluirEstudo(item: Cronograma) {
    this.cronogramaService.concluirItemCronograma(item.cod, !item.concluido).subscribe(() => {
      this.getCronogramaDoDia();
      this.toastr.success('Estudo atualizado!');
      
    })
}

trocarDia() {
  this.atualizarComponente();
}

atualizarComponente() {
  this.getCronogramaDoDia();
  this.getEstudosRealizadosDoDia();
}

getEstudosRealizadosDoDia() {
  this.reesService.listarRegistrosDeEstudoPorData(this.pageRegistros - 1, new Date(this.data).toISOString().split('T')[0]).subscribe((estudos) => {
    this.registrosEstudo = estudos;
    this.qtdeItensRegistroEstudo = estudos.length;
    this.getTempoDeEstudos(this.registrosEstudo);
  })
}

getTempoDeEstudos(item: Rees[]): void {
  this.tempoDeEstudo = 0;
  item.forEach((item) => {
    const tempo = item.tempo.split(':');
    this.tempoDeEstudo += parseInt(tempo[0]) * 3600 + parseInt(tempo[1]) * 60 + parseInt(tempo[2]);
  })
  this.tempoDeEstudoFormatado = TransformaTempo.transformaTempo(this.tempoDeEstudo);
}

voltarPagina(type: string): void {
  console.log(type);
  if (type === 'rees') {
    if (this.pageRegistros > 1) {
      this.pageRegistros--;
      this.getEstudosRealizadosDoDia();
    }
  } else {
    if (this.page > 1) {
      this.page--;
      this.getCronogramaDoDia();
    }
  }
}

proximaPagina(type: string): void {
  if (type === 'rees') {
    if (this.qtdeItensRegistroEstudo == 5) {
      console.log(this.qtdeItensRegistroEstudo);
      this.pageRegistros++;
      this.getEstudosRealizadosDoDia();
    }
  } else {
    if (this.qtdeItensCronograma == 5) {
      this.page++;
      this.getCronogramaDoDia();
    }
  }
}

  getTotalItensCronograma(): void {
    this.cronogramaService.listar().subscribe((cronograma: Cronograma[]) => {
      this.itensCronograma = cronograma
      this.qtdTotalItensCronograma= cronograma.length;
    })

  }

  getCronogramaDoDia(): void {
    this.cronogramaService.listarCronogramaPorData(this.page - 1, new Date(this.data).toISOString().split('T')[0]).subscribe((cronograma: Cronograma[]) => {
      this.itensCronograma = cronograma
      this.qtdeItensCronograma = cronograma.length;
    } )
  }
}
