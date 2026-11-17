package com.projeto.config;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.projeto.model.Cadastro;
import com.projeto.model.PerfilUsuario;
import com.projeto.model.Viagem;
import com.projeto.repository.CadastroRepository;
import com.projeto.repository.CriarViagemRepository;
import com.projeto.repository.PerfilUsuarioRepository;
import com.projeto.service.SenhaService;

// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// DADOS DE EXEMPLO. Quando o servidor liga e o banco está VAZIO (sem nenhuma
// viagem), ele cria sozinho:
//   - 1 conta de GUIA de demonstração (com foto e capa no perfil)
//   - 1 conta de VIAJANTE de demonstração (para testar compras)
//   - 6 viagens prontas, com foto
// Assim, quem clonar o projeto e rodar pela primeira vez já vê o site com
// conteúdo, sem precisar cadastrar nada.
//
// ✅ SEGURO: se o banco JÁ TEM viagens (como o seu, com as suas viagens), nada
//    é criado nem alterado. Também nunca cria duas vezes.
//
// ✏️ ONDE MUDAR O QUÊ:
//   - Logins e senha das contas de exemplo ... constantes EMAIL_GUIA, EMAIL_VIAJANTE, SENHA
//   - As viagens (destino, preço, datas) ...... método criarViagens()
//   - Desligar completamente ................... variável de ambiente DADOS_EXEMPLO=false
//     (ou rr.dados-exemplo=false no application.properties)
//   - Imagens ................................. pasta src/main/resources/imagens/demo
// ============================================================
@Component
@Order(10)
public class DadosDeExemplo implements ApplicationRunner {

    public static final String EMAIL_GUIA = "guia.demo@rrturismo.test";
    public static final String EMAIL_VIAJANTE = "viajante.demo@rrturismo.test";
    public static final String SENHA = "Demo@1234";

    private final CadastroRepository cadastroRepository;
    private final CriarViagemRepository viagemRepository;
    private final PerfilUsuarioRepository perfilRepository;
    private final SenhaService senhaService;
    private final boolean ligado;

    public DadosDeExemplo(CadastroRepository cadastroRepository,
                          CriarViagemRepository viagemRepository,
                          PerfilUsuarioRepository perfilRepository,
                          SenhaService senhaService,
                          @Value("${DADOS_EXEMPLO:${rr.dados-exemplo:true}}") boolean ligado) {
        this.cadastroRepository = cadastroRepository;
        this.viagemRepository = viagemRepository;
        this.perfilRepository = perfilRepository;
        this.senhaService = senhaService;
        this.ligado = ligado;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!ligado || viagemRepository.count() > 0) {
            return; // desligado, ou o banco já tem viagens: não mexe em nada
        }
        try {
            Cadastro guia = criarGuia();
            criarViajante();
            criarViagens(guia);
            System.out.println();
            System.out.println("=== DADOS DE EXEMPLO CRIADOS (banco vazio) ===");
            System.out.println("  Guia ....... " + EMAIL_GUIA + "  /  senha: " + SENHA);
            System.out.println("  Viajante ... " + EMAIL_VIAJANTE + "  /  senha: " + SENHA);
            System.out.println("==============================================");
            System.out.println();
        } catch (Exception e) {
            // Os dados de exemplo são só um "extra": se algo falhar, o site continua normal.
            System.out.println("Não foi possível criar os dados de exemplo: " + e.getMessage());
        }
    }

    // ---------------- contas ----------------
    private Cadastro criarGuia() {
        Cadastro guia = cadastroRepository.findFirstByEmailOrderByIdDesc(EMAIL_GUIA).orElseGet(() -> {
            Cadastro c = new Cadastro();
            c.setNome("Guia Demonstração");
            c.setEmail(EMAIL_GUIA);
            c.setGuia(true);
            c.setLocal("São Paulo, SP");
            c.setCadastur("00.000000.00-0");
            c.setSenha(senhaService.gerarHash(SENHA));
            return cadastroRepository.save(c);
        });

        if (perfilRepository.findByUsuario(guia).isEmpty()) {
            PerfilUsuario p = new PerfilUsuario();
            p.setUsuario(guia);
            p.setCidade("São Paulo");
            p.setEstado("SP");
            p.setSobre("Esta é uma conta de demonstração do RR Turismo. Aqui você vê como fica o perfil de um guia, "
                    + "com capa, foto e as viagens que ele oferece. Pode explorar à vontade!");
            p.setIdiomas("Português, Inglês");
            p.setEspecialidades("Cultura, Natureza, Aventura");
            p.setClientesAtendidos(120);
            p.setViagensRealizadas(36);
            p.setFoto(ler("guia-demo.jpg"));
            p.setBanner(ler("fernando-de-noronha.jpg"));
            perfilRepository.save(p);
        }
        return guia;
    }

    private void criarViajante() {
        if (cadastroRepository.findFirstByEmailOrderByIdDesc(EMAIL_VIAJANTE).isPresent()) {
            return;
        }
        Cadastro c = new Cadastro();
        c.setNome("Viajante Demonstração");
        c.setEmail(EMAIL_VIAJANTE);
        c.setLocal("Taquaritinga, SP");
        c.setSenha(senhaService.gerarHash(SENHA));
        cadastroRepository.save(c);
    }

    // ---------------- viagens ----------------
    // As datas são calculadas a partir de HOJE, então as viagens de exemplo
    // nunca ficam "no passado", não importa quando o projeto for rodado.
    private void criarViagens(Cadastro guia) {
        LocalDate hoje = LocalDate.now();

        viagem(guia, "rio-de-janeiro.jpg", "Rio de Janeiro: Cristo, Pão de Açúcar e Santa Teresa",
                "Rio de Janeiro, RJ", "Cultural", "Ônibus", "1890.00", 40, 12,
                "Hotel Copacabana Praia (3 noites, café da manhã)", hoje.plusDays(30), 4,
                "Conheça os cartões-postais do Rio em um roteiro completo: o Cristo Redentor, o bondinho do Pão de Açúcar, "
                + "a escadaria Selarón e um passeio pelos bares de Santa Teresa. Saída de ônibus executivo, hospedagem "
                + "perto da praia e acompanhamento de guia durante todos os passeios.");

        viagem(guia, "gramado.jpg", "Gramado e Canela: serra gaúcha de ponta a ponta",
                "Gramado, RS", "Romântico", "Ônibus", "1590.00", 36, 9,
                "Pousada Chalé da Serra (3 noites, café colonial)", hoje.plusDays(45), 4,
                "Ruas charmosas, chocolates artesanais, fondue e a Cascata do Caracol. Um roteiro tranquilo para casais "
                + "e famílias, com tempo livre para passear pelo centro de Gramado e visitar o Lago Negro.");

        viagem(guia, "fernando-de-noronha.jpg", "Fernando de Noronha: o paraíso das águas cristalinas",
                "Fernando de Noronha, PE", "Praia", "Avião", "5890.00", 20, 6,
                "Pousada Vila dos Ventos (5 noites, café da manhã)", hoje.plusDays(60), 6,
                "Mergulho com tartarugas, o pôr do sol na Praia do Sancho e a vista do Morro Dois Irmãos. Pacote com "
                + "passagem aérea, traslados, hospedagem e passeio de barco pela ilha. Vagas limitadas.");

        viagem(guia, "foz-do-iguacu.jpg", "Foz do Iguaçu: Cataratas dos dois lados da fronteira",
                "Foz do Iguaçu, PR", "Ecoturismo", "Avião", "2390.00", 30, 14,
                "Hotel das Cataratas Plaza (3 noites, café da manhã)", hoje.plusDays(75), 4,
                "Cataratas do lado brasileiro e argentino, Parque das Aves e a Usina de Itaipu. Inclui passeio de barco "
                + "até as quedas, trilhas guiadas e traslados. Leve capa de chuva e protetor solar.");

        viagem(guia, "bonito.jpg", "Bonito: flutuação, grutas e rios de águas claras",
                "Bonito, MS", "Aventura", "Van", "2750.00", 16, 5,
                "Pousada Águas do Prata (4 noites, café da manhã)", hoje.plusDays(90), 5,
                "Flutuação no Rio Sucuri, Gruta do Lago Azul, Buraco das Araras e banho de cachoeira. Roteiro de "
                + "aventura com equipamentos inclusos e guias credenciados, em grupo pequeno.");

        viagem(guia, "salvador.jpg", "Salvador: Pelourinho, axé e muito sabor baiano",
                "Salvador, BA", "Gastronômico", "Avião", "2190.00", 32, 11,
                "Hotel Pelourinho Colonial (4 noites, café da manhã)", hoje.plusDays(105), 5,
                "Centro histórico, Elevador Lacerda, Igreja do Bonfim e, claro, acarajé, moqueca e vatapá. Aulas de "
                + "samba, passeio de barco na Baía de Todos os Santos e tempo livre nas praias.");
    }

    private void viagem(Cadastro guia, String arquivo, String nome, String local, String categoria,
                        String transporte, String preco, int assentos, int participantes, String hotel,
                        LocalDate ida, int dias, String descricao) {
        Viagem v = new Viagem();
        v.setCriador(guia);
        v.setNomedestino(nome);
        v.setLocal(local);
        v.setCategoria(categoria);
        v.setTransporte(transporte);
        v.setPreco(new BigDecimal(preco));
        v.setAssentos(assentos);
        v.setParticipantes(participantes);
        v.setHotel(hotel);
        v.setPessoas(2);
        v.setDataIda(ida);
        v.setDataVolta(ida.plusDays(dias));
        v.setDescricao(descricao);
        v.setImagem(ler(arquivo));
        viagemRepository.save(v);
    }

    // Lê uma imagem da pasta de recursos (funciona rodando pelo rodar.bat/rodar.sh e pelo Docker).
    private byte[] ler(String arquivo) {
        String[] caminhos = { "main/resources/imagens/demo/" + arquivo, "imagens/demo/" + arquivo };
        for (String caminho : caminhos) {
            ClassPathResource recurso = new ClassPathResource(caminho);
            if (recurso.exists()) {
                try (InputStream in = recurso.getInputStream()) {
                    return in.readAllBytes();
                } catch (Exception e) {
                    // tenta o próximo caminho
                }
            }
        }
        return null; // sem a imagem, a viagem é criada mesmo assim
    }
}
