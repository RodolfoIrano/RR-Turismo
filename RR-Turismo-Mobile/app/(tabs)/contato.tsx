import { Mascara, Documento } from '../../utils/mascaras';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { TextInput } from '@/components/TextoTraduzido';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { coresInstitucionais, coresInstitucionaisFixas } from '@/constants/temaInstitucional';

// ============================================================
// TIPOS DO FORMULÁRIO
// ------------------------------------------------------------
// Define quais informações serão armazenadas no formulário.
// ============================================================
type FormData = {
    nomeCompleto: string;
    empresa: string;
    cidade: string;
    email: string;
    telefone: string;
    assunto: string;
    mensagem: string;
};


// ============================================================
// OPÇÕES DE ASSUNTO
// ------------------------------------------------------------
// Essas opções aparecem como botões para o usuário escolher.
// ============================================================
const ASSUNTOS = [
    'Elogio ou sugestão',
    'Solicitar orçamento',
    'Dúvida sobre pacote',
    'Reclamação',
    'Parceria comercial',
    'Outro',
];


// ============================================================
// COMPONENTE DE CAMPO REUTILIZÁVEL
// ------------------------------------------------------------
// Evita repetir o mesmo código para cada campo do formulário.
// Recebe informações como título, valor, placeholder e tipo
// do teclado.
// ============================================================
function Campo({
    label,
    obrigatorio,
    value,
    onChangeText,
    placeholder,
    multiline,
    keyboardType,
    colorScheme,
}: {
    label: string;
    obrigatorio?: boolean;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    colorScheme: 'light' | 'dark' | null | undefined;
}) {

    // Resolve as cores (nomeadas, ver constants/temaInstitucional.ts)
    // de acordo com o tema claro ou escuro do aparelho.
    const cores = coresInstitucionais(colorScheme);

    const inputStyle = [
        styles.input,
        multiline && styles.inputMultiline,
        {
            backgroundColor: cores.cartao,
            color: cores.texto,
            borderColor: cores.borda,
        },
    ];

    return (
        <ThemedView style={styles.campoContainer}>

            {/* Nome do campo e indicação de obrigatório */}
            <ThemedText style={styles.label}>
                {label}
                {obrigatorio && (
                    <ThemedText style={styles.asterisco}> *</ThemedText>
                )}
            </ThemedText>

            {/* Campo onde o usuário digita as informações */}
            <TextInput
                style={inputStyle}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={cores.placeholder}
                multiline={multiline}
                numberOfLines={multiline ? 5 : 1}
                textAlignVertical={multiline ? 'top' : 'center'}
                keyboardType={keyboardType ?? 'default'}
                autoCapitalize={
                    keyboardType === 'email-address'
                        ? 'none'
                        : 'sentences'
                }
            />
        </ThemedView>
    );
}


// ============================================================
// TELA PRINCIPAL - FALE CONOSCO
// ============================================================
export default function ContatoScreen() {

    // Identifica se o aparelho está usando tema claro ou escuro
    const colorScheme = useColorScheme();

    // Cores nomeadas já resolvidas para o modo claro/escuro atual
    // (ver constants/temaInstitucional.ts).
    const cores = coresInstitucionais(colorScheme);


    // ==========================================================
    // ESTADO DO FORMULÁRIO
    // ----------------------------------------------------------
    // Guarda todos os valores preenchidos pelo usuário.
    // ==========================================================
    const [form, setForm] = useState<FormData>({
        nomeCompleto: '',
        empresa: '',
        cidade: '',
        email: '',
        telefone: '',
        assunto: ASSUNTOS[0],
        mensagem: '',
    });


    // ==========================================================
    // ATUALIZAÇÃO DOS CAMPOS
    // ----------------------------------------------------------
    // Cria uma função que altera apenas o campo informado,
    // mantendo os outros valores do formulário.
    // ==========================================================
    const set = (field: keyof FormData) => (value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));


    // ==========================================================
    // VALIDAÇÃO DO FORMULÁRIO
    // ----------------------------------------------------------
    // Verifica se os campos obrigatórios foram preenchidos
    // antes de permitir o envio.
    // ==========================================================
    const validar = (): boolean => {

        if (!form.nomeCompleto.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Por favor, informe seu nome completo.'
            );
            return false;
        }

        if (!form.cidade.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Por favor, informe sua cidade.'
            );
            return false;
        }

        if (!form.email.trim() || !form.email.includes('@')) {
            Alert.alert(
                'E-mail inválido',
                'Por favor, informe um e-mail válido.'
            );
            return false;
        }

        if (!Documento.telefoneValido(form.telefone)) {
            Alert.alert(
                'Campo obrigatório',
                'Informe um telefone válido com DDD.'
            );
            return false;
        }

        if (!form.mensagem.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Por favor, escreva sua mensagem.'
            );
            return false;
        }

        // Se nenhuma validação falhar, o formulário está válido
        return true;
    };


    // ==========================================================
    // ENVIO DO FORMULÁRIO
    // ==========================================================
    const handleEnviar = () => {

        // Primeiro verifica se os dados estão corretos
        if (!validar()) return;

        // Aqui futuramente pode ser integrada uma API,
        // serviço de e-mail ou WhatsApp.

        Alert.alert(
            '✅ Mensagem enviada com sucesso!',
            'Recebemos sua mensagem. Em breve nossa equipe entrará em contato com você.',
            [
                {
                    text: 'OK',

                    // Depois que o usuário confirmar, limpa o formulário
                    onPress: () =>
                        setForm({
                            nomeCompleto: '',
                            empresa: '',
                            cidade: '',
                            email: '',
                            telefone: '',
                            assunto: ASSUNTOS[0],
                            mensagem: '',
                        }),
                },
            ]
        );
    };


    // (colorScheme já é usado diretamente por coresInstitucionais() acima)



    // ==========================================================
    // INTERFACE DA TELA
    // ==========================================================
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}

            // No iOS, ajusta a tela quando o teclado aparece
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >

            {/* Permite rolar o formulário e continuar digitando
                mesmo quando o teclado estiver aberto */}
            <ScrollView
                style={[
                    styles.container,
                    {
                        backgroundColor: cores.fundoTela,
                    },
                ]}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >

                {/* =================================================
                    CABEÇALHO
                    ================================================= */}
                <ThemedView style={styles.header}>

                    <ThemedText
                        type="title"
                        style={styles.titulo}
                    >
                        Fale Conosco
                    </ThemedText>

                    <ThemedText style={styles.subtitulo}>
                        Preencha os campos abaixo para solicitar informações
                        ou receber contato via e-mail.
                    </ThemedText>

                    {/* Indica que os campos com * são obrigatórios */}
                    <ThemedText style={styles.obrigatorioAviso}>
                        campos obrigatórios *
                    </ThemedText>

                </ThemedView>


                {/* =================================================
                    FORMULÁRIO
                    ================================================= */}
                <ThemedView style={styles.form}>

                    {/* Nome completo */}
                    <Campo
                        label="Nome Completo"
                        obrigatorio
                        value={form.nomeCompleto}
                        onChangeText={set('nomeCompleto')}
                        placeholder="Digite seu nome completo"
                        colorScheme={colorScheme}
                    />


                    {/* Empresa - campo opcional */}
                    <Campo
                        label="Empresa"
                        value={form.empresa}
                        onChangeText={set('empresa')}
                        placeholder="Digite o nome da empresa (opcional)"
                        colorScheme={colorScheme}
                    />


                    {/* Cidade */}
                    <Campo
                        label="Cidade"
                        obrigatorio
                        value={form.cidade}
                        onChangeText={set('cidade')}
                        placeholder="Digite sua cidade"
                        colorScheme={colorScheme}
                    />


                    {/* E-mail */}
                    <Campo
                        label="E-mail para contato"
                        obrigatorio
                        value={form.email}
                        onChangeText={set('email')}
                        placeholder="Por favor, digite seu e-mail"
                        keyboardType="email-address"
                        colorScheme={colorScheme}
                    />


                    {/* Telefone */}
                    <Campo
                        label="Telefone para contato"
                        obrigatorio
                        value={form.telefone}
                        onChangeText={(v) => set('telefone')(Mascara.telefone(v))}
                        placeholder="(00) 00000-0000"
                        keyboardType="phone-pad"
                        colorScheme={colorScheme}
                    />


                    {/* =================================================
                        ASSUNTO
                        -------------------------------------------------
                        O usuário escolhe uma das opções disponíveis.
                        ================================================= */}
                    <ThemedView style={styles.campoContainer}>

                        <ThemedText style={styles.label}>
                            Assunto{' '}
                            <ThemedText style={styles.asterisco}>
                                *
                            </ThemedText>
                        </ThemedText>

                        {/* Lista horizontal dos assuntos */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            <ThemedView style={styles.assuntosRow}>

                                {ASSUNTOS.map((op) => {

                                    // Verifica qual opção está selecionada
                                    const selecionado =
                                        form.assunto === op;

                                    return (
                                        <TouchableOpacity
                                            key={op}
                                            style={[
                                                styles.assuntoBtn,

                                                // Aplica o estilo quando selecionado
                                                selecionado &&
                                                    styles.assuntoBtnAtivo,

                                                {
                                                    borderColor:
                                                        selecionado
                                                            ? cores.marca
                                                            : cores.borda,

                                                    backgroundColor:
                                                        selecionado
                                                            ? cores.marca
                                                            : cores.cartao,
                                                },
                                            ]}

                                            // Atualiza o assunto escolhido
                                            onPress={() =>
                                                set('assunto')(op)
                                            }
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.assuntoBtnText,
                                                    {
                                                        color: selecionado
                                                            ? cores.sobreMarca
                                                            : cores.textoInativo,
                                                    },
                                                ]}
                                            >
                                                {op}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}

                            </ThemedView>
                        </ScrollView>
                    </ThemedView>


                    {/* Campo de mensagem */}
                    <Campo
                        label="Mensagem"
                        obrigatorio
                        value={form.mensagem}
                        onChangeText={set('mensagem')}
                        placeholder="Por favor, digite sua mensagem..."
                        multiline
                        colorScheme={colorScheme}
                    />


                    {/* =================================================
                        BOTÃO ENVIAR
                        ================================================= */}
                    <TouchableOpacity
                        style={styles.btnEnviar}
                        onPress={handleEnviar}
                    >
                        <ThemedText style={styles.btnEnviarText}>
                            Enviar
                        </ThemedText>
                    </TouchableOpacity>

                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


// ============================================================
// ESTILOS DA TELA
// ------------------------------------------------------------
// Define espaçamentos, cores, tamanhos e posicionamento
// dos elementos da tela.
// ============================================================
const styles = StyleSheet.create({

    // Container principal
    container: {
        flex: 1,
    },

    // Espaço inferior para não cortar o último elemento
    scrollContent: {
        paddingBottom: 40,
    },

    // Cabeçalho da tela
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 16,
        gap: 8,
        backgroundColor: 'transparent',
    },

    // Título principal
    titulo: {
        color: coresInstitucionaisFixas.marca,
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Texto abaixo do título
    subtitulo: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 20,
    },

    // Aviso sobre campos obrigatórios
    obrigatorioAviso: {
        color: coresInstitucionaisFixas.obrigatorio,
        fontSize: 13,
        alignSelf: 'flex-start',
        marginTop: 4,
    },

    // Área do formulário
    form: {
        paddingHorizontal: 20,
        gap: 16,
        backgroundColor: 'transparent',
    },

    // Container de cada campo
    campoContainer: {
        gap: 6,
        backgroundColor: 'transparent',
    },

    // Nome dos campos
    label: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Asterisco dos campos obrigatórios
    asterisco: {
        color: coresInstitucionaisFixas.obrigatorio,
        fontWeight: '700',
    },

    // Estilo padrão dos inputs
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 15,
    },

    // Tamanho específico do campo de mensagem
    inputMultiline: {
        height: 130,
        paddingTop: 12,
    },

    // Linha dos botões de assunto
    assuntosRow: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
        backgroundColor: 'transparent',
    },

    // Botão individual de assunto
    assuntoBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },

    // Estilo usado quando o assunto está selecionado
    assuntoBtnAtivo: {},

    // Texto dos botões de assunto
    assuntoBtnText: {
        fontSize: 13,
        fontWeight: '500',
    },

    // Botão principal de envio
    btnEnviar: {
        backgroundColor: coresInstitucionaisFixas.marca,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },

    // Texto do botão Enviar
    btnEnviarText: {
        color: coresInstitucionaisFixas.sobreMarca,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
