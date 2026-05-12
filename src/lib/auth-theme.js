export const pageShellStyle = {
  minHeight: '100vh',
  padding: '32px 24px 56px',
  background:
    'radial-gradient(circle at top, rgba(30, 64, 175, 0.22), transparent 26%), linear-gradient(180deg, #07111f 0%, #0b1528 46%, #101b31 100%)',
}

export const loadingCardStyle = {
  minWidth: '320px',
  maxWidth: '460px',
  margin: '72px auto',
  padding: '26px 30px',
  borderRadius: '24px',
  background: 'rgba(10, 19, 35, 0.88)',
  color: '#f7f4ea',
  border: '1px solid rgba(245, 179, 66, 0.16)',
  boxShadow: '0 28px 72px rgba(2, 6, 23, 0.42)',
}

export function getSplitLayoutStyle(isCompact, formWidth = 'minmax(400px, 0.92fr)') {
  return {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isCompact ? '1fr' : `minmax(0, 1.08fr) ${formWidth}`,
    borderRadius: isCompact ? '26px' : '34px',
    overflow: 'hidden',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    background: 'rgba(9, 18, 32, 0.64)',
    boxShadow: '0 32px 90px rgba(2, 6, 23, 0.36)',
    backdropFilter: 'blur(16px)',
  }
}

export function getFormPanelStyle(isCompact) {
  return {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: isCompact ? '30px 22px 34px' : '48px clamp(24px, 4vw, 54px)',
    color: '#f8fafc',
    background:
      'linear-gradient(180deg, rgba(7, 16, 29, 0.96) 0%, rgba(12, 23, 42, 0.98) 62%, rgba(17, 29, 50, 0.98) 100%)',
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
  background: 'linear-gradient(135deg, #1d4ed8 0%, #0f2f74 68%, #f2b94b 100%)',
  color: '#fffdf6',
  fontWeight: 800,
  letterSpacing: '0.08em',
  boxShadow: '0 14px 30px rgba(29, 78, 216, 0.28)',
}

export const brandTextStyle = {
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: '#f2b94b',
}

export const formTitleStyle = {
  margin: '0 0 10px',
  fontSize: 'clamp(34px, 3vw, 42px)',
  lineHeight: 1.02,
  letterSpacing: '-0.04em',
  color: '#f8fafc',
}

export const formBodyStyle = {
  margin: 0,
  color: 'rgba(226, 232, 240, 0.76)',
  fontSize: '15px',
  lineHeight: 1.75,
}

export const formStyle = { display: 'grid', gap: '18px' }
export const fieldStyle = { display: 'grid', gap: '8px' }

export const labelStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#dbe5f3',
  letterSpacing: '0.02em',
}

export const inputStyle = {
  width: '100%',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '18px',
  background: 'rgba(8, 15, 28, 0.78)',
  color: '#f8fafc',
  padding: '14px 16px',
  fontSize: '15px',
  outline: 'none',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
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
  color: '#f2b94b',
  fontSize: '12px',
  fontWeight: 700,
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
  borderRadius: '18px',
  border: '1px solid rgba(248, 113, 113, 0.24)',
  background: 'rgba(127, 29, 29, 0.28)',
  color: '#fecaca',
  padding: '14px 16px',
  fontSize: '14px',
}

export const pendingStyle = {
  borderRadius: '18px',
  border: '1px solid rgba(96, 165, 250, 0.2)',
  background: 'rgba(15, 54, 118, 0.28)',
  color: '#dbeafe',
  padding: '14px 16px',
  fontSize: '14px',
}

export const messageStyle = {
  borderRadius: '18px',
  border: '1px solid rgba(74, 222, 128, 0.22)',
  background: 'rgba(20, 83, 45, 0.3)',
  color: '#bbf7d0',
  padding: '14px 16px',
  fontSize: '14px',
}

export const noteStyle = {
  marginTop: '16px',
  borderRadius: '18px',
  border: '1px solid rgba(245, 179, 66, 0.18)',
  background: 'rgba(120, 74, 8, 0.18)',
  color: '#fde68a',
  padding: '14px 16px',
  fontSize: '14px',
  lineHeight: 1.6,
}

export const footerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '22px',
  color: 'rgba(226, 232, 240, 0.68)',
  fontSize: '14px',
}

export const footerLinkStyle = {
  color: '#f2b94b',
  textDecoration: 'none',
  fontWeight: 700,
}

export const inlineLinkStyle = footerLinkStyle

export const roleHelpStyle = {
  marginTop: '12px',
  fontSize: '14px',
  color: 'rgba(226, 232, 240, 0.68)',
}

export const checkboxGroupStyle = { display: 'grid', gap: '12px', marginTop: '2px' }

export const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  color: '#dbe5f3',
  fontSize: '14px',
  lineHeight: 1.6,
}

export const checkboxStyle = {
  width: '18px',
  height: '18px',
  marginTop: '2px',
  flexShrink: 0,
  accentColor: '#f2b94b',
}

export const dualGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
}
