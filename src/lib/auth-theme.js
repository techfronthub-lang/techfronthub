export const pageShellStyle = {
  minHeight: '100vh',
  padding: '32px 24px 56px',
  background:
    'radial-gradient(circle at 12% 0%, rgba(223, 240, 255, 0.82), transparent 28%), linear-gradient(180deg, #ffffff 0%, #f7fbff 48%, #ffffff 100%)',
}

export const loadingCardStyle = {
  minWidth: '320px',
  maxWidth: '460px',
  margin: '72px auto',
  padding: '26px 30px',
  borderRadius: '22px',
  background: 'rgba(255, 255, 255, 0.94)',
  color: '#10233f',
  border: '1px solid rgba(93, 125, 160, 0.18)',
  boxShadow: '0 24px 72px rgba(16, 35, 63, 0.12)',
}

export function getSplitLayoutStyle(isCompact, formWidth = 'minmax(400px, 0.92fr)') {
  return {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isCompact ? '1fr' : `minmax(0, 1.08fr) ${formWidth}`,
    borderRadius: isCompact ? '24px' : '30px',
    overflow: 'hidden',
    border: '1px solid rgba(93, 125, 160, 0.18)',
    background: 'rgba(255, 255, 255, 0.94)',
    boxShadow: '0 30px 84px rgba(16, 35, 63, 0.14)',
    backdropFilter: 'blur(16px)',
  }
}

export function getFormPanelStyle(isCompact) {
  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: isCompact ? '30px 22px 34px' : '48px clamp(24px, 4vw, 54px)',
    color: '#10233f',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.98) 100%)',
  }
}

export const formHeaderStyle = { marginBottom: '24px' }

export const brandStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
}

export const brandMarkStyle = {
  width: '44px',
  height: '44px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #0b84df 0%, #0669bd 100%)',
  color: '#ffffff',
  fontWeight: 800,
  letterSpacing: '0.08em',
  boxShadow: '0 14px 30px rgba(11, 132, 223, 0.24)',
}

export const brandTextStyle = {
  fontSize: '13px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: '#0669bd',
}

export const formTitleStyle = {
  margin: '0 0 10px',
  fontSize: 'clamp(32px, 3vw, 42px)',
  lineHeight: 1.04,
  letterSpacing: 0,
  color: '#10233f',
}

export const formBodyStyle = {
  margin: 0,
  color: '#53657a',
  fontSize: '15px',
  lineHeight: 1.75,
}

export const formStyle = { display: 'grid', gap: '18px' }
export const fieldStyle = { display: 'grid', gap: '8px' }

export const labelStyle = {
  fontSize: '13px',
  fontWeight: 800,
  color: '#10233f',
  letterSpacing: '0.02em',
}

export const inputStyle = {
  width: '100%',
  border: '1px solid rgba(93, 125, 160, 0.28)',
  borderRadius: '16px',
  background: '#ffffff',
  color: '#10233f',
  padding: '14px 16px',
  fontSize: '15px',
  outline: 'none',
  boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset',
}

export const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '112px',
}

export const passwordWrapStyle = { position: 'relative' }

export const toggleStyle = {
  position: 'absolute',
  top: '50%',
  right: '12px',
  transform: 'translateY(-50%)',
  border: 0,
  background: 'transparent',
  color: '#0669bd',
  fontSize: '12px',
  fontWeight: 800,
  cursor: 'pointer',
}

export const submitStyle = {
  justifyContent: 'center',
  width: '100%',
  marginTop: '8px',
  padding: '15px 18px',
  borderRadius: '16px',
}

export const secondaryButtonStyle = {
  width: '100%',
  justifyContent: 'center',
  padding: '14px 18px',
  borderRadius: '16px',
}

export const errorStyle = {
  borderRadius: '16px',
  border: '1px solid rgba(180, 35, 24, 0.18)',
  background: '#fff1f0',
  color: '#b42318',
  padding: '14px 16px',
  fontSize: '14px',
}

export const pendingStyle = {
  borderRadius: '16px',
  border: '1px solid rgba(11, 132, 223, 0.18)',
  background: '#eaf6ff',
  color: '#075599',
  padding: '14px 16px',
  fontSize: '14px',
}

export const messageStyle = {
  borderRadius: '16px',
  border: '1px solid rgba(17, 132, 91, 0.18)',
  background: '#e9f8f1',
  color: '#11845b',
  padding: '14px 16px',
  fontSize: '14px',
}

export const noteStyle = {
  marginTop: '16px',
  borderRadius: '16px',
  border: '1px solid rgba(180, 83, 9, 0.18)',
  background: '#fff7ed',
  color: '#92400e',
  padding: '14px 16px',
  fontSize: '14px',
  lineHeight: 1.6,
}

export const footerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '22px',
  color: '#53657a',
  fontSize: '14px',
}

export const footerLinkStyle = {
  color: '#0669bd',
  textDecoration: 'none',
  fontWeight: 800,
}

export const inlineLinkStyle = footerLinkStyle

export const roleHelpStyle = {
  marginTop: '12px',
  fontSize: '14px',
  color: '#53657a',
}

export const checkboxGroupStyle = { display: 'grid', gap: '12px', marginTop: '2px' }

export const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  color: '#53657a',
  fontSize: '14px',
  lineHeight: 1.6,
}

export const checkboxStyle = {
  width: '18px',
  height: '18px',
  marginTop: '2px',
  flexShrink: 0,
  accentColor: '#0b84df',
}

export const dualGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
}
