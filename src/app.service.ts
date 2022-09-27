import { Jogador } from './interfaces/jogador.interface';
import { Desafio } from './interfaces/desafio.interface';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { MailerService } from '@nestjs-modules/mailer';
import { lastValueFrom } from 'rxjs';
import HTML_NOTIFICACAO_ADVERSARIO from './static/html-notificacao-adversario';

@Injectable()
export class AppService {
  constructor(
    private clientProxySmartRanking: ClientProxySmartRanking,
    private readonly mailerService: MailerService,
  ) {}

  private readonly logger = new Logger(AppService.name);
  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async enviarEmailParaAdversario(desafio: Desafio): Promise<void> {
    try {
      /*
        Identificar o ID fo jogador
      */

      let idAdversario = '';

      desafio.jogadores.map((jogador) => {
        if (jogador != desafio.solicitante) {
          idAdversario = jogador;
        }
      });

      //Consultar as info adicionais dos jogadores

      const adversario: Jogador = await lastValueFrom(
        this.clientAdminBackend.send('consultar-jogadores', idAdversario),
      );

      const solicitante: Jogador = await lastValueFrom(
        this.clientAdminBackend.send(
          'consultar-jogadores',
          desafio.solicitante,
        ),
      );

      let markup = '';

      markup = HTML_NOTIFICACAO_ADVERSARIO;
      markup = markup.replace(/#NOME_ADVERSARIO/g, adversario.nome);
      markup = markup.replace(/##NOME_SOLICITANTE/g, solicitante.nome);

      this.mailerService
        .sendMail({
          to: adversario.email,
          from: '"SMAR RANKING" <leonardonatal1993@gmail.com>',
          subject: 'Notificacao de desafio',
          html: markup,
        })
        .then((success) => {
          this.logger.log(success);
        })
        .catch((err) => {
          this.logger.log(err);
        });
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
