# FINANZZI iOS — EAS / Apple

O projeto mobile usa Expo SDK 54 e está preparado para EAS Build.

## Build na nuvem

Na pasta `mobile`:

```bash
eas login
eas build --platform ios --profile production
```

A primeira execução solicitará as credenciais Apple. O EAS pode gerenciar os certificados e provisioning profiles remotamente.

## TestFlight

Depois que a build estiver pronta:

```bash
eas submit --platform ios --profile production
```

É necessária uma conta Apple Developer paga para distribuição/TestFlight. O bundle identifier configurado é `com.finanzzi.app`.

## Perfis

- `development`: development client + distribuição interna.
- `preview`: build interna para testes.
- `production`: build de distribuição com incremento automático do build number.

## Importante

Nunca commit de certificados, provisioning profiles, `.p8`, senhas, `EXPO_TOKEN` ou outras credenciais neste repositório. Credenciais Apple devem permanecer no EAS/Apple ou nos secrets do CI.
