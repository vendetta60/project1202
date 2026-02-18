// Reusable form styling objects and utilities

export const selectStylesLight = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: '#fff',
    borderColor: state.isFocused ? '#3e4a21' : 'rgba(0, 0, 0, 0.23)',
    borderWidth: 1,
    boxShadow: state.isFocused ? '0 0 0 1px #3e4a21' : 'none',
    '&:hover': {
      borderColor: '#3e4a21',
    },
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3e4a21' : state.isFocused ? '#f0f0f0' : '#fff',
    color: state.isSelected ? '#fff' : '#333',
    padding: '8px 12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#3e4a21' : '#e8e8e8',
    },
  }),
  menuList: (base: any) => ({
    ...base,
    padding: 0,
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '4px 8px',
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
};

/**
 * Convert array of objects to react-select format
 * @param data Array of objects
 * @param labelKey Key to use for display label
 * @param valueKey Key to use for value (default: 'id')
 * @returns Array of {value, label} objects
 */
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
