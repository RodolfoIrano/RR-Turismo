// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ (SEM USO NO APP):
// Veio pronto do template do Expo, pra abrir links externos.
// Nenhuma tela do RR Turismo usa isso hoje.
// ============================================================
// ============================================================
// COMPONENTE DE EXEMPLO DO TEMPLATE EXPO - SEM USO NO APP
// ------------------------------------------------------------
// Abre um link externo dentro de um navegador embutido no app,
// em vez do navegador padrão do aparelho. Nenhuma tela do RR
// Turismo usa isso hoje.
// ============================================================
import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
