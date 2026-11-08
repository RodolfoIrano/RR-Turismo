// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Cuida da FOTO DE PERFIL e da CAPA (banner) do usuário: busca as
// imagens atuais no servidor, abre a galeria do celular, envia a
// imagem nova e atualiza a tela. É usado pela tela Perfil e pela
// tela Editar perfil (assim a lógica existe num lugar só).
// ============================================================
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../contexts/AuthContext";
import { useTraducao } from "../traducoes/TraducaoContext";
import {
  atualizarBannerPerfil,
  atualizarFotoPerfil,
  fontePerfilBanner,
  fontePerfilFoto,
} from "../services/authService";

// Imagem pronta para o <Image> do expo-image (uri + header de login).
export type FonteDeImagem = { uri: string; headers: Record<string, string> };

export function usePerfilImagens() {
  const { user } = useAuth();
  const { t } = useTraducao();

  const [foto, setFoto] = useState<FonteDeImagem | null>(null);
  const [banner, setBanner] = useState<FonteDeImagem | null>(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoBanner, setEnviandoBanner] = useState(false);

  // Busca as imagens salvas no servidor quando o usuário (ou o fato de
  // ele ter foto/capa) muda.
  const carregarFoto = useCallback(async () => {
    setFoto(user?.temFoto ? await fontePerfilFoto() : null);
  }, [user?.temFoto]);

  const carregarBanner = useCallback(async () => {
    setBanner(user?.temBanner ? await fontePerfilBanner() : null);
  }, [user?.temBanner]);

  useEffect(() => { carregarFoto(); }, [carregarFoto]);
  useEffect(() => { carregarBanner(); }, [carregarBanner]);

  // Abre a galeria. "proporcao" = formato do recorte ([1,1] foto, [16,9] capa).
  async function escolherImagem(proporcao: [number, number]): Promise<string | null> {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(t.perfil.titulo, t.perfil.permissaoNegada);
      return null;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: proporcao,
      quality: 0.7,
    });
    if (resultado.canceled || !resultado.assets?.[0]) return null;
    return resultado.assets[0].uri;
  }

  async function trocarFoto() {
    const uri = await escolherImagem([1, 1]);
    if (!uri) return;
    setEnviandoFoto(true);
    try {
      await atualizarFotoPerfil(uri);
      setFoto({ uri, headers: {} }); // mostra na hora, sem esperar o servidor
      Alert.alert(t.perfil.titulo, t.perfil.fotoAtualizada);
    } catch (erro) {
      Alert.alert(t.comum.erro, erro instanceof Error ? erro.message : t.perfil.erroFoto);
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function trocarBanner() {
    const uri = await escolherImagem([16, 9]);
    if (!uri) return;
    setEnviandoBanner(true);
    try {
      await atualizarBannerPerfil(uri);
      setBanner({ uri, headers: {} });
      Alert.alert(t.perfil.titulo, t.perfil.bannerAtualizado);
    } catch (erro) {
      Alert.alert(t.comum.erro, erro instanceof Error ? erro.message : t.perfil.erroBanner);
    } finally {
      setEnviandoBanner(false);
    }
  }

  return { foto, banner, enviandoFoto, enviandoBanner, trocarFoto, trocarBanner };
}
