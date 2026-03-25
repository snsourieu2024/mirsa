interface StarterAnchor {
  label: string
  question_examples: string[]
  response_text: string
  concern_level: 'normal' | 'elevated'
}

export const STARTER_ANCHORS: StarterAnchor[] = [
  {
    label: 'keys_location',
    question_examples: [
      'Where are my keys?',
      'Have you seen my keys?',
      'I can\'t find my keys',
      'Where did I put my keys?',
    ],
    response_text: 'Robert, your keys are on the hook by the front door.',
    concern_level: 'normal',
  },
  {
    label: 'medication',
    question_examples: [
      'Did I take my medication?',
      'Have I had my pills?',
      'When do I take my medicine?',
      'Did I already take that?',
    ],
    response_text: 'You took your morning medication at 8am with breakfast. Your next dose is at 8pm tonight.',
    concern_level: 'elevated',
  },
  {
    label: 'day_date',
    question_examples: [
      'What day is it?',
      'What is today\'s date?',
      'What day of the week is it?',
      'Is it Monday?',
    ],
    response_text: 'Today is {{date}}.',
    concern_level: 'normal',
  },
  {
    label: 'daily_schedule',
    question_examples: [
      'What\'s happening today?',
      'What are we doing today?',
      'Do I have anything on today?',
      'What\'s the plan for today?',
    ],
    response_text: '{{schedule}}',
    concern_level: 'normal',
  },
  {
    label: 'caregiver_location',
    question_examples: [
      'Where is Margaret?',
      'Where has Margaret gone?',
      'When is Margaret coming back?',
      'Where is my wife?',
    ],
    response_text: 'Margaret is nearby. She\'ll be with you soon, Robert.',
    concern_level: 'normal',
  },
  {
    label: 'meals',
    question_examples: [
      'Have I eaten?',
      'Did I have breakfast?',
      'When is lunch?',
      'What\'s for dinner?',
    ],
    response_text: '{{schedule}}',
    concern_level: 'normal',
  },
  {
    label: 'visitors',
    question_examples: [
      'Is anyone coming today?',
      'Who is visiting?',
      'When is Sarah coming?',
      'Are the grandchildren coming?',
    ],
    response_text: '{{schedule}}',
    concern_level: 'normal',
  },
  {
    label: 'home_safety',
    question_examples: [
      'Is the door locked?',
      'Did I leave the stove on?',
      'Is the house locked up?',
      'Are the windows closed?',
    ],
    response_text: 'Everything is safe and secure, Robert. The doors are locked.',
    concern_level: 'normal',
  },
  {
    label: 'time_of_day',
    question_examples: [
      'What time is it?',
      'Is it morning or afternoon?',
      'How long until dinner?',
      'Is it bedtime?',
    ],
    response_text: 'Today is {{date}}.',
    concern_level: 'normal',
  },
  {
    label: 'deceased_family',
    question_examples: [
      'Where is my mother?',
      'When is dad coming?',
      'I want to see my parents',
      'Where has mother gone?',
    ],
    response_text: 'Your mother loved you very much, Robert. Margaret is here with you now.',
    concern_level: 'elevated',
  },
  {
    label: 'wallet_location',
    question_examples: [
      'Where is my wallet?',
      'Have you seen my wallet?',
      'I can\'t find my wallet',
      'Where did I leave my wallet?',
    ],
    response_text: 'Your wallet is in the top drawer of your bedside table, Robert.',
    concern_level: 'normal',
  },
  {
    label: 'glasses_location',
    question_examples: [
      'Where are my glasses?',
      'Have you seen my glasses?',
      'I can\'t find my reading glasses',
      'Where did I put my glasses?',
    ],
    response_text: 'Your glasses are on the side table next to your chair, Robert.',
    concern_level: 'normal',
  },
]
