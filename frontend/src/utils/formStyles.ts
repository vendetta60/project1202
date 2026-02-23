// Reusable form styling – primary color comes from theme so selects follow app theme

export function getSelectStyles(primaryColor: string) {
  return {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'var(--app-paper, #fff)',
      borderColor: state.isFocused ? primaryColor : 'rgba(0, 0, 0, 0.23)',
      borderWidth: 1,
      boxShadow: state.isFocused ? `0 0 0 1px ${primaryColor}` : 'none',
      '&:hover': { borderColor: primaryColor },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? primaryColor : state.isFocused ? 'rgba(0,0,0,0.06)' : 'var(--app-paper, #fff)',
      color: state.isSelected ? '#fff' : 'var(--app-text, #333)',
      padding: '8px 12px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? primaryColor : 'rgba(0,0,0,0.08)',
      },
    }),
    menuList: (base: any) => ({ ...base, padding: 0 }),
    valueContainer: (base: any) => ({ ...base, padding: '4px 8px' }),
    input: (base: any) => ({ ...base, margin: 0, padding: 0 }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  };
}

/** Default for components that don't pass theme yet (uses CSS var or fallback) */
export const selectStylesLight = getSelectStyles('#3e4a21');

export const toSelectOptions = (
  data: any[],
  labelKey: string,
  valueKey: string = 'id'
) => {
  return data?.map((item) => ({
    value: item[valueKey],
    label: item[labelKey],
  })) || [];
};
