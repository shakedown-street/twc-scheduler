import { Checkbox } from '../Checkbox/Checkbox';
import { Input, InputProps } from '../Input/Input';
import { RadixPopover } from '../RadixPopover/RadixPopover';
import './MultiSelect.scss';

export type MultiSelectOption = {
  label: string;
  value: string;
};

export type MultiSelectProps = {
  inputProps?: Omit<InputProps, 'readOnly' | 'value'>;
  onChange?: (value: string[]) => void;
  options?: MultiSelectOption[];
  value?: string[];
};

export const MultiSelect = ({ inputProps, onChange, options, value }: MultiSelectProps) => {
  function valueToString() {
    if (!value || value.length < 1) {
      return '';
    }
    return `${value.length} selected`;
  }

  return (
    <>
      <RadixPopover
        align="start"
        className="p-4"
        close={false}
        trigger={<Input readOnly value={valueToString()} type="text" {...inputProps} />}
      >
        <div className="MultiSelect">
          <div className="MultiSelect__options">
            {options?.map((option) => {
              return (
                <Checkbox
                  key={option.value}
                  checked={value?.includes(option.value)}
                  label={option.label}
                  inputSize="xs"
                  onChange={() => {
                    if (value?.includes(option.value)) {
                      onChange?.(value.filter((v) => v !== option.value));
                    } else {
                      onChange?.([...(value || []), option.value]);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </RadixPopover>
    </>
  );
};
