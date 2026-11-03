package com.projeto.service;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Service;

// ============================================================
// SENHA SERVICE (hash seguro de senha, algoritmo PBKDF2)
// ------------------------------------------------------------
// NUNCA guardamos a senha do usuário em texto puro no banco.
// Em vez disso, guardamos um "hash": um valor derivado da senha
// que não pode ser revertido de volta para a senha original.
//
// Formato salvo no banco (dentro de Cadastro.senha):
//   pbkdf2$<iterações>$<salt em base64>$<hash em base64>
//
// - "salt": valor aleatório único por senha, para que duas
//   pessoas com a mesma senha tenham hashes diferentes (evita
//   ataques com tabelas prontas de senhas comuns).
// - "iterações": quantas vezes o algoritmo é repetido, para
//   tornar o cálculo mais lento de propósito (dificulta tentar
//   "adivinhar" senhas por força bruta).
// ============================================================
@Service
public class SenhaService {
    private static final String PREFIXO = "pbkdf2";
    private static final String ALGORITMO = "PBKDF2WithHmacSHA256";
    private static final int ITERACOES = 120_000;
    private static final int TAMANHO_SALT = 16;
    private static final int TAMANHO_HASH = 256;

    private final SecureRandom secureRandom = new SecureRandom();

    // Gera o hash completo (com um novo salt aleatório) para uma senha nova.
    public String gerarHash(String senha) {
        byte[] salt = new byte[TAMANHO_SALT];
        secureRandom.nextBytes(salt);
        byte[] hash = gerarPbkdf2(senha, salt, ITERACOES);

        return PREFIXO
                + "$" + ITERACOES
                + "$" + Base64.getEncoder().encodeToString(salt)
                + "$" + Base64.getEncoder().encodeToString(hash);
    }

    // Confere se a senha digitada no login bate com o hash salvo no banco.
    public boolean senhaCorreta(String senhaDigitada, String senhaSalva) {
        if (senhaDigitada == null || senhaSalva == null) {
            return false;
        }

        // Compatibilidade com contas antigas que, por algum motivo,
        // ainda não tenham hash (comparação direta de texto).
        if (!senhaEstaComHash(senhaSalva)) {
            return senhaDigitada.equals(senhaSalva);
        }

        // Extrai as partes salvas (iterações, salt, hash) do formato "pbkdf2$...".
        String[] partes = senhaSalva.split("\\$");
        if (partes.length != 4) {
            return false;
        }

        byte[] hashSalvo;
        byte[] hashDigitado;
        try {
            int iteracoes = Integer.parseInt(partes[1]);
            byte[] salt = Base64.getDecoder().decode(partes[2]);
            hashSalvo = Base64.getDecoder().decode(partes[3]);
            // Recalcula o hash da senha DIGITADA usando o MESMO salt salvo,
            // para depois comparar os dois hashes.
            hashDigitado = gerarPbkdf2(senhaDigitada, salt, iteracoes);
        } catch (IllegalArgumentException e) {
            return false;
        }

        return comparacaoConstante(hashSalvo, hashDigitado);
    }

    public boolean senhaEstaComHash(String senha) {
        return senha != null && senha.startsWith(PREFIXO + "$");
    }

    // Executa o algoritmo PBKDF2 propriamente dito.
    private byte[] gerarPbkdf2(String senha, byte[] salt, int iteracoes) {
        try {
            KeySpec spec = new PBEKeySpec(senha.toCharArray(), salt, iteracoes, TAMANHO_HASH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITMO);
            return factory.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Erro ao proteger a senha.", e);
        }
    }

    // Compara dois hashes byte a byte SEMPRE no mesmo tempo,
    // independente de onde eles diferem. Isso evita "timing
    // attacks" (alguém tentando descobrir a senha medindo quanto
    // tempo a comparação demora).
    private boolean comparacaoConstante(byte[] a, byte[] b) {
        if (a.length != b.length) {
            return false;
        }

        int resultado = 0;
        for (int i = 0; i < a.length; i++) {
            resultado |= a[i] ^ b[i];
        }
        return resultado == 0;
    }
}
