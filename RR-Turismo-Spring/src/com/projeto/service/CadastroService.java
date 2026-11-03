package com.projeto.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.projeto.model.Cadastro;
import com.projeto.repository.CadastroRepository;

// ============================================================
// CADASTRO SERVICE
// ------------------------------------------------------------
// Regras de negócio em torno do usuário (Cadastro): criar,
// buscar, e validar login por e-mail/senha.
//
// USADO TANTO PELO SITE QUANTO PELO APP MOBILE: o site usa este
// serviço através de EntrarController/CadastroController; o app
// Mobile usa o mesmo serviço através de AuthApiController. É
// assim que os dois compartilham o mesmo usuário/senha.
// ============================================================
@Service
public class CadastroService {
    private final CadastroRepository cadastroRepository;
    private final SenhaService senhaService;

    public CadastroService(CadastroRepository cadastroRepository, SenhaService senhaService) {
        this.cadastroRepository = cadastroRepository;
        this.senhaService = senhaService;
    }

    // Salva um cadastro novo ou atualiza um já existente (se "id" já existir).
    public Cadastro salvar(Cadastro cadastro) {
        return cadastroRepository.save(cadastro);
    }

    public Optional<Cadastro> buscarPorId(int id) {
        return cadastroRepository.findById(id);
    }

    // Confere e-mail + senha. Se baterem, devolve o usuário; se não, devolve vazio.
    public Optional<Cadastro> buscarPorEmailESenha(String email, String senha) {
        Optional<Cadastro> usuario = cadastroRepository.findFirstByEmailOrderByIdDesc(email);
        if (usuario.isEmpty() || !senhaService.senhaCorreta(senha, usuario.get().getSenha())) {
            return Optional.empty();
        }

        Cadastro cadastro = usuario.get();

        // Migração automática: se a senha desse usuário ainda estava
        // guardada de um jeito antigo (sem hash seguro), ela é
        // re-salva já com hash PBKDF2 no momento do login. Assim,
        // contas antigas ficam seguras sem precisar de ação manual.
        if (!senhaService.senhaEstaComHash(cadastro.getSenha())) {
            cadastro.setSenha(senhaService.gerarHash(senha));
            cadastroRepository.save(cadastro);
        }

        return Optional.of(cadastro);
    }

    public boolean emailJaCadastrado(String email) {
        return cadastroRepository.findFirstByEmailOrderByIdDesc(email).isPresent();
    }

    // Gera o hash seguro de uma senha em texto puro, pronto para ser gravado no banco.
    public String protegerSenha(String senha) {
        return senhaService.gerarHash(senha);
    }
}
