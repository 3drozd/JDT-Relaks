# Konfiguracja domeny w Resend

## Kiedy to zrobić
Gdy kupisz domenę dla strony (np. twojafirma.pl) i chcesz wysyłać maile z własnego adresu (np. events@twojafirma.pl).

## Kroki

1. Wejdź w Resend → Domains → Add Domain
2. Wpisz swoją domenę (np. twojafirma.pl)
3. Region: eu-west-1 (Ireland)
4. Resend pokaże rekordy DNS do dodania - dodaj je w panelu dostawcy domeny
5. Kliknij Verify w Resend
6. Po weryfikacji zmień `email.from` w `src/config/site.config.ts`:
   ```
   from: "Wydarzenia <events@twojafirma.pl>"
   ```

## Rekordy DNS do dodania (uzupełnij po zakupie domeny)

Typ: ...
Nazwa: ...
Wartość: ...

(Skopiuj tutaj rekordy z Resend gdy będziesz konfigurować domenę)
