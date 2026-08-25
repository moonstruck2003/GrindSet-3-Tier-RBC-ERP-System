/** Shared design tokens for ERP pages. Pass lightMode boolean, get consistent theme object. */
export function useTheme(lightMode) {
  return lightMode
    ? {
        pageBg:    '#F0F2F5',
        cardBg:    'rgba(255,255,255,0.96)',
        cardBdr:   '#DFE1E6',
        textPri:   '#091E42',
        textSec:   '#253858',
        textMut:   '#5E6C84',
        inputBg:   '#FFFFFF',
        inputBdr:  '#C1C7D0',
        inputClr:  '#091E42',
        divider:   '#DFE1E6',
        rowHover:  '#F8F9FD',
        shimmer:   'linear-gradient(90deg,#E6E8EB 25%,#F0F2F5 50%,#E6E8EB 75%)',
      }
    : {
        pageBg:    '#070F1F',
        cardBg:    'rgba(11,27,61,0.65)',
        cardBdr:   'rgba(255,255,255,0.07)',
        textPri:   '#F4F5F7',
        textSec:   '#B3D4FF',
        textMut:   '#8993A4',
        inputBg:   'rgba(255,255,255,0.04)',
        inputBdr:  '#1E2D4A',
        inputClr:  '#F4F5F7',
        divider:   'rgba(255,255,255,0.06)',
        rowHover:  'rgba(255,255,255,0.03)',
        shimmer:   'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.03) 75%)',
      };
}
