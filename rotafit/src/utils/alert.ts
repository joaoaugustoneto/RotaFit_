import { Alert as RNAlert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Diálogo de alerta compatível com Web e Mobile.
 * No react-native-web, o Alert.alert é um no-op vazio.
 * Esta função utiliza window.confirm/window.alert na Web e o Alert nativo no iOS/Android.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const text = [title, message].filter(Boolean).join('\n\n');

    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }

    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    const actionBtn =
      buttons.find((b) => b.style !== 'cancel') ?? buttons[buttons.length - 1];

    const confirmed = window.confirm(text);
    if (confirmed) {
      actionBtn?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }

  RNAlert.alert(title, message, buttons);
}
