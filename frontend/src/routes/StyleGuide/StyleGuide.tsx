import {
  Badge,
  BasicImageUpload,
  Button,
  Callout,
  Card,
  Checkbox,
  Container,
  DatePicker,
  FileDropArea,
  IconButton,
  Input,
  MultiSelect,
  Radio,
  RadixDialog,
  RadixPopover,
  RadixTooltip,
  SearchPopover,
  Select,
  Spinner,
  TabItem,
  Tabs,
  Textarea,
  TimeInput,
  Toggle,
  useToast,
} from '@/ui';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import './StyleGuide.scss';

export const StyleGuide = () => {
  const tabs = [
    'Badge',
    'Button',
    'Callout',
    'Card',
    'Checkbox',
    'DatePicker',
    'Dialog',
    'Drawer',
    'FileUpload',
    'IconButton',
    'Input',
    'MultiSelect',
    'Popover',
    'Radio',
    'SearchPopover',
    'Select',
    'Spinner',
    'Tabs',
    'Textarea',
    'TimeInput',
    'Toaster',
    'Toggle',
    'Tooltip',
  ];

  const selectOptions = (
    <>
      <option value="Beef">Beef</option>
      <option value="Pork">Pork</option>
      <option value="Chicken">Chicken</option>
    </>
  );

  const [datePickerValue, setDatePickerValue] = React.useState<Date | undefined>(new Date());
  const [multiSelectValue, setMultiSelectValue] = React.useState<string[]>([]);
  const [timeInputValue, setTimeInputValue] = React.useState<string>('12:00:00');
  const [searchPopoverSelected, setSearchPopoverSelected] = React.useState<any>();

  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error, warning, info } = useToast();

  const selectedTab = searchParams.get('tab') || tabs[0];

  function handleTabChange(tab: string) {
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  }

  return (
    <>
      <Helmet>
        <title>Style Guide | Schedule Builder</title>
      </Helmet>
      <div className="StyleGuide my-12">
        <Container>
          <Card fluid>
            <h1 className="mb-8">Style Guide</h1>
            <Tabs className="mb-8">
              {tabs.map((tab, index) => (
                <TabItem
                  key={index}
                  active={selectedTab === tab}
                  onClick={() => {
                    handleTabChange(tab);
                  }}
                >
                  {tab}
                </TabItem>
              ))}
            </Tabs>
            <h3 className="mb-8">{selectedTab}</h3>
            {selectedTab === 'Badge' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Color</h4>
                    <div className="grid grid-columns-3 gap-4 justify-items-center">
                      <Badge>Default</Badge>
                      <Badge color="primary">Primary</Badge>
                      <Badge color="red">Red</Badge>
                      <Badge color="orange">Orange</Badge>
                      <Badge color="yellow">Yellow</Badge>
                      <Badge color="green">Green</Badge>
                      <Badge color="blue">Blue</Badge>
                      <Badge color="indigo">Indigo</Badge>
                      <Badge color="violet">Violet</Badge>
                    </div>
                    <h4>Radius</h4>
                    <div className="flex align-center gap-4">
                      <Badge radius="none">None</Badge>
                      <Badge radius="sm">Small</Badge>
                      <Badge radius="md">Medium</Badge>
                      <Badge radius="lg">Large</Badge>
                      <Badge radius="2xl">2XL</Badge>
                    </div>
                    <h4>Size</h4>
                    <div className="flex align-center gap-4">
                      <Badge size="xs">Extra Small</Badge>
                      <Badge size="sm">Small</Badge>
                      <Badge size="md">Medium</Badge>
                      <Badge size="lg">Large</Badge>
                      <Badge size="xl">Extra Large</Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Button' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Variant</h4>
                    <div className="flex align-center gap-4">
                      <Button>Default</Button>
                      <Button variant="outlined">Outlined</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="raised">Raised</Button>
                    </div>
                    <div className="flex align-center gap-4">
                      <Button color="primary">Default</Button>
                      <Button color="primary" variant="outlined">
                        Outlined
                      </Button>
                      <Button color="primary" variant="ghost">
                        Ghost
                      </Button>
                      <Button color="primary" variant="raised">
                        Raised
                      </Button>
                    </div>
                    <h4>Color</h4>
                    <div className="grid grid-columns-3 gap-4">
                      <Button variant="raised">Default</Button>
                      <Button color="primary" variant="raised">
                        Primary
                      </Button>
                      <Button color="red" variant="raised">
                        Red
                      </Button>
                      <Button color="orange" variant="raised">
                        Orange
                      </Button>
                      <Button color="yellow" variant="raised">
                        Yellow
                      </Button>
                      <Button color="green" variant="raised">
                        Green
                      </Button>
                      <Button color="blue" variant="raised">
                        Blue
                      </Button>
                      <Button color="indigo" variant="raised">
                        Indigo
                      </Button>
                      <Button color="violet" variant="raised">
                        Violet
                      </Button>
                    </div>
                    <h4>Icon</h4>
                    <div className="flex align-center gap-4">
                      <Button iconLeading="edit" variant="raised">
                        Leading
                      </Button>
                      <Button iconTrailing="edit" variant="raised">
                        Trailing
                      </Button>
                    </div>
                    <h4>Radius</h4>
                    <div className="flex align-center gap-4">
                      <Button radius="none" variant="raised">
                        None
                      </Button>
                      <Button radius="sm" variant="raised">
                        Small
                      </Button>
                      <Button radius="md" variant="raised">
                        Medium
                      </Button>
                      <Button radius="lg" variant="raised">
                        Large
                      </Button>
                      <Button radius="3xl" variant="raised">
                        3XL
                      </Button>
                    </div>
                    <h4>Size</h4>
                    <div className="flex align-center gap-4">
                      <Button size="xs" variant="raised">
                        Extra Small
                      </Button>
                      <Button size="sm" variant="raised">
                        Small
                      </Button>
                      <Button size="md" variant="raised">
                        Medium
                      </Button>
                      <Button size="lg" variant="raised">
                        Large
                      </Button>
                      <Button size="xl" variant="raised">
                        Extra Large
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Callout' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Default</h4>
                    <Callout>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla rhoncus tempor neque, sed malesuada
                      eros dapibus vel. Aliquam in ligula vitae tortor porttitor laoreet iaculis finibus est.
                    </Callout>
                    <h4>Color</h4>
                    <div className="grid grid-columns-3 gap-4" style={{ width: '100%' }}>
                      <Callout header="Header">Default</Callout>
                      <Callout color="primary" header="Header">
                        Primary
                      </Callout>
                      <Callout color="red" header="Header">
                        Red
                      </Callout>
                      <Callout color="orange" header="Header">
                        Orange
                      </Callout>
                      <Callout color="yellow" header="Header">
                        Yellow
                      </Callout>
                      <Callout color="green" header="Header">
                        Green
                      </Callout>
                      <Callout color="blue" header="Header">
                        Blue
                      </Callout>
                      <Callout color="indigo" header="Header">
                        Indigo
                      </Callout>
                      <Callout color="violet" header="Header">
                        Violet
                      </Callout>
                    </div>
                    <h4>Icon</h4>
                    <Callout header="Header" icon="help">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla rhoncus tempor neque, sed malesuada
                      eros dapibus vel. Aliquam in ligula vitae tortor porttitor laoreet iaculis finibus est.
                    </Callout>
                    <h4>onDismiss</h4>
                    <Callout header="Header" onDismiss={() => {}}>
                      Has a close button
                    </Callout>
                    <h4>Radius</h4>
                    <div className="flex align-center gap-4">
                      <Callout header="Header" radius="none">
                        None
                      </Callout>
                      <Callout header="Header" radius="sm">
                        Small
                      </Callout>
                      <Callout header="Header" radius="md">
                        Medium
                      </Callout>
                      <Callout header="Header" radius="lg">
                        Large
                      </Callout>
                    </div>
                    <h4>Shadow</h4>
                    <div className="flex align-center gap-4">
                      <Callout header="Header" shadow="none">
                        None
                      </Callout>
                      <Callout header="Header" shadow="sm">
                        Small
                      </Callout>
                      <Callout header="Header" shadow="md">
                        Medium
                      </Callout>
                      <Callout header="Header" shadow="lg">
                        Large
                      </Callout>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Card' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Default</h4>
                    <Card>
                      <h4>Header</h4>
                      <p>Content</p>
                    </Card>
                    <h4>Radius</h4>
                    <div className="flex align-center gap-4">
                      <Card radius="none">
                        <h4>None</h4>
                        <p>Content</p>
                      </Card>
                      <Card radius="sm">
                        <h4>Small</h4>
                        <p>Content</p>
                      </Card>
                      <Card radius="md">
                        <h4>Medium</h4>
                        <p>Content</p>
                      </Card>
                      <Card radius="lg">
                        <h4>Large</h4>
                        <p>Content</p>
                      </Card>
                    </div>
                    <h4>Shadow</h4>
                    <div className="flex align-center gap-4">
                      <Card shadow="none">
                        <h4>None</h4>
                        <p>Content</p>
                      </Card>
                      <Card shadow="sm">
                        <h4>Small</h4>
                        <p>Content</p>
                      </Card>
                      <Card shadow="md">
                        <h4>Medium</h4>
                        <p>Content</p>
                      </Card>
                      <Card shadow="lg">
                        <h4>Large</h4>
                        <p>Content</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Checkbox' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <Checkbox inputSize="xs" label="Extra Small" />
                    <Checkbox inputSize="sm" label="Small" />
                    <Checkbox inputSize="md" label="Medium" />
                    <Checkbox inputSize="lg" label="Large" />
                    <Checkbox inputSize="xl" label="Extra Large" />
                    <Checkbox disabled label="Disabled" />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'DatePicker' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <DatePicker onChange={(value) => setDatePickerValue(value)} value={datePickerValue} />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Dialog' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <RadixDialog
                      className="p-6"
                      title="Example Dialog"
                      trigger={<Button variant="raised">Open Dialog</Button>}
                    >
                      <h2>Dialog</h2>
                      <p>Content</p>
                    </RadixDialog>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Drawer' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <RadixDialog
                      asDrawer
                      className="p-6"
                      title="Example Drawer"
                      trigger={<Button variant="raised">Open Drawer</Button>}
                    >
                      <h2>Drawer</h2>
                      <p>Content</p>
                    </RadixDialog>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'FileUpload' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-8">
                    <h4>FileDropArea</h4>
                    <FileDropArea />
                    <h4>BasicImageUpload</h4>
                    <BasicImageUpload />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'IconButton' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Variant</h4>
                    <div className="flex gap-4">
                      <IconButton>
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton variant="outlined">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton variant="ghost">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                    </div>
                    <div className="flex gap-4">
                      <IconButton color="primary">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary" variant="outlined">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary" variant="ghost">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                    </div>
                    <h4>Color</h4>
                    <div className="grid grid-columns-3 gap-4">
                      <IconButton>
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="red">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="orange">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="yellow">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="green">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="blue">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="indigo">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="violet">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                    </div>
                    <h4>Radius</h4>
                    <div className="flex gap-4">
                      <IconButton color="primary" radius="none" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary" radius="sm" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary" radius="md" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary" radius="lg" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton color="primary" radius="full" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                    </div>
                    <h4>Size</h4>
                    <div className="flex align-center gap-4">
                      <IconButton size="xs" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton size="sm" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton size="md" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton size="lg" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                      <IconButton size="xl" variant="raised">
                        <span className="material-symbols-outlined">edit</span>
                      </IconButton>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Input' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Default</h4>
                    <Input />
                    <h4>Underline</h4>
                    <Input variant="underline" />
                    <h4>Filled</h4>
                    <Input variant="filled" />
                    <h4>Placeholder</h4>
                    <Input placeholder="Placeholder" />
                    <h4>Invalid</h4>
                    <Input defaultValue="test" type="email" />
                    <h4>Icon Leading</h4>
                    <Input iconLeading="search" />
                    <h4>Icon Trailing</h4>
                    <Input iconTrailing="search" />
                    <h4>Disabled</h4>
                    <Input disabled />
                    <h4>Radius</h4>
                    <Input placeholder="None" radius="none" />
                    <Input placeholder="Small" radius="sm" />
                    <Input placeholder="Medium" radius="md" />
                    <Input placeholder="Large" radius="lg" />
                    <Input placeholder="2XL" radius="2xl" />
                    <h4>Size</h4>
                    <Input inputSize="xs" placeholder="Extra small" />
                    <Input inputSize="sm" placeholder="Small" />
                    <Input inputSize="md" placeholder="Medium" />
                    <Input inputSize="lg" placeholder="Large" />
                    <Input inputSize="xl" placeholder="Extra large" />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'MultiSelect' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <MultiSelect
                      onChange={(e) => setMultiSelectValue(e)}
                      options={[
                        { label: 'Option 1', value: 'option-1' },
                        { label: 'Option 2', value: 'option-2' },
                      ]}
                      value={multiSelectValue}
                    />
                    <p className="hint mt-4">(I'm thinking of deprecating this component)</p>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Popover' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <RadixPopover className="p-4" trigger={<Button variant="raised">Open Popover</Button>}>
                      <h6>Header</h6>
                      <p>Content</p>
                    </RadixPopover>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Radio' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <Radio name="radio" inputSize="xs" label="Extra Small" value="xs" />
                    <Radio name="radio" inputSize="sm" label="Small" value="sm" />
                    <Radio name="radio" inputSize="md" label="Medium" value="md" />
                    <Radio name="radio" inputSize="lg" label="Large" value="lg" />
                    <Radio name="radio" inputSize="xl" label="Extra Large" value="xl" />
                    <Radio disabled name="radio" label="Disabled" value="disabled" />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'SearchPopover' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <SearchPopover
                      endpoint="/api/users/"
                      onChange={(selected) => {
                        setSearchPopoverSelected(selected);
                      }}
                      parameter="search"
                      renderMatch={(match) => {
                        return <>{match.email}</>;
                      }}
                      searchLabel="Search users"
                      trigger={
                        <Button className="mb-4" variant="raised">
                          Open Search Popover
                        </Button>
                      }
                    />
                    <p>Selected: {searchPopoverSelected ? searchPopoverSelected.email : 'None'}</p>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Select' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Default</h4>
                    <Select id="test" label="Test">
                      {selectOptions}
                    </Select>
                    <h4>Underline</h4>
                    <Select variant="underline">{selectOptions}</Select>
                    <h4>Filled</h4>
                    <Select variant="filled">{selectOptions}</Select>
                    <h4>Icon Leading</h4>
                    <Select iconLeading="search">{selectOptions}</Select>
                    <h4>Disabled</h4>
                    <Select disabled>{selectOptions}</Select>
                    <h4>Radius</h4>
                    <Select radius="none">{selectOptions}</Select>
                    <Select radius="sm">{selectOptions}</Select>
                    <Select radius="md">{selectOptions}</Select>
                    <Select radius="lg">{selectOptions}</Select>
                    <Select radius="2xl">{selectOptions}</Select>
                    <h4>Size</h4>
                    <Select inputSize="xs">{selectOptions}</Select>
                    <Select inputSize="sm">{selectOptions}</Select>
                    <Select inputSize="md">{selectOptions}</Select>
                    <Select inputSize="lg">{selectOptions}</Select>
                    <Select inputSize="xl">{selectOptions}</Select>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Spinner' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Default</h4>
                    <Spinner />
                    <h4>Message</h4>
                    <Spinner message="Fetching Updates..." />
                    <h4>Sizes</h4>
                    <div className="flex align-center gap-4">
                      <Spinner message="Extra Small" size="xs" />
                      <Spinner message="Small" size="sm" />
                      <Spinner message="Medium" size="md" />
                      <Spinner message="Large" size="lg" />
                      <Spinner message="Extra Large" size="xl" />
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Tabs' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <Tabs>
                      <TabItem active>Tab 1</TabItem>
                      <TabItem>Tab 2</TabItem>
                      <TabItem>Tab 3</TabItem>
                    </Tabs>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Textarea' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Default</h4>
                    <Textarea />
                    <h4>Underline</h4>
                    <Textarea variant="underline" />
                    <h4>Filled</h4>
                    <Textarea variant="filled" />
                    <h4>Placeholder</h4>
                    <Textarea placeholder="Placeholder" />
                    <h4>Icon Leading</h4>
                    <Textarea iconLeading="search" />
                    <h4>Icon Trailing</h4>
                    <Textarea iconTrailing="search" />
                    <h4>Disabled</h4>
                    <Textarea disabled />
                    <h4>Radius</h4>
                    <Textarea placeholder="None" radius="none" />
                    <Textarea placeholder="Small" radius="sm" />
                    <Textarea placeholder="Medium" radius="md" />
                    <Textarea placeholder="Large" radius="lg" />
                    <Textarea placeholder="2XL" radius="2xl" />
                    <h4>Size</h4>
                    <Textarea inputSize="xs" placeholder="Extra small" />
                    <Textarea inputSize="sm" placeholder="Small" />
                    <Textarea inputSize="md" placeholder="Medium" />
                    <Textarea inputSize="lg" placeholder="Large" />
                    <Textarea inputSize="xl" placeholder="Extra large" />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'TimeInput' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <TimeInput
                      min="09:00:00"
                      max="12:00:00"
                      onChange={(e) => {
                        setTimeInputValue(e);
                      }}
                      value={timeInputValue}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Toaster' && (
              <>
                <p className="mb-4">Click to trigger toast</p>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content">
                    <div className="flex gap-4">
                      <Button
                        color="blue"
                        onClick={() => {
                          info('Info');
                        }}
                        variant="ghost"
                      >
                        Info
                      </Button>
                      <Button
                        color="green"
                        onClick={() => {
                          success('Success');
                        }}
                        variant="ghost"
                      >
                        Success
                      </Button>
                      <Button
                        color="orange"
                        onClick={() => {
                          warning('Warning');
                        }}
                        variant="ghost"
                      >
                        Warning
                      </Button>
                      <Button
                        color="red"
                        onClick={() => {
                          error('Error');
                        }}
                        variant="ghost"
                      >
                        Error
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Toggle' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <h4>Default</h4>
                    <Toggle />
                    <h4>Label</h4>
                    <Toggle label="Left" />
                    <Toggle label="Right" labelPosition="right" />
                    <h4>Disabled</h4>
                    <Toggle checked disabled />
                  </div>
                </div>
              </>
            )}
            {selectedTab === 'Tooltip' && (
              <>
                <div className="StyleGuide__example">
                  <div className="StyleGuide__example__content gap-4">
                    <p>Hover the button to see the tooltip</p>
                    <RadixTooltip
                      side="right"
                      sideOffset={4}
                      trigger={
                        <IconButton color="primary" radius="full" size="xl" variant="ghost">
                          <span className="material-symbols-outlined">add</span>
                        </IconButton>
                      }
                    >
                      Add to library
                    </RadixTooltip>
                  </div>
                </div>
              </>
            )}
          </Card>
        </Container>
      </div>
    </>
  );
};
