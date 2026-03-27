import { useState, useRef, useEffect, useMemo } from 'react';
import type { Recommendations, PrescriptionItem, PrescriptionTemplate, Diagnosis } from '../types';
import { LAB_CATALOG, IMAGING_CATALOG } from '../data/medicalKnowledge';
import { ICD_CODES } from '../data/icdCodes';
import { MEDICINES_LIST } from '../data/medicines';
import SpeechMicButton from './SpeechMicButton';
import { useAuth } from '../context/AuthContext';
import * as libraryService from '../services/libraryService';


interface CustomICDCode {
  code: string;
  description: string;
  category: string;
}

interface InstructionTemplate {
  id: string;
  name: string;
  text: string;
}

interface Props {
  recommendations: Recommendations;
  setRecommendations: (r: Recommendations) => void;
  prescriptions: PrescriptionItem[];
  setPrescriptions: (p: PrescriptionItem[]) => void;
  selectedLabs: string[];
  setSelectedLabs: (l: string[]) => void;
  selectedImaging: string[];
  setSelectedImaging: (i: string[]) => void;
  customLabs: string[];
  setCustomLabs: (l: string[]) => void;
  customImaging: string[];
  setCustomImaging: (i: string[]) => void;
  onNext: () => void;
}


let cachedIcdApiBaseUrl: string | null = null;

export default function RecommendationPanel({ recommendations, setRecommendations, prescriptions, setPrescriptions, selectedLabs, setSelectedLabs, selectedImaging, setSelectedImaging, customLabs, setCustomLabs, customImaging, setCustomImaging, onNext }: Props) {
  const [activeSection, setActiveSection] = useState('diagnoses');
  const [labSearch, setLabSearch] = useState('');
  const [icdSearch, setIcdSearch] = useState('');
  const [activeIcdRow, setActiveIcdRow] = useState<number | null>(null);
  const [activeIcdSuggestionIndex, setActiveIcdSuggestionIndex] = useState<number>(-1);
  const [apiIcdCodes, setApiIcdCodes] = useState<{ code: string, description: string, category: string }[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [activeMedRow, setActiveMedRow] = useState<number | null>(null);
  const [activeMedSuggestionIndex, setActiveMedSuggestionIndex] = useState<number>(-1);

  const { clinic } = useAuth();
  const clinicId = clinic?.id || 'default';

  const [customMedicines, setCustomMedicines] = useState<string[]>([]);
  
  // Real-time subscription for customMedicines
  useEffect(() => {
    if (!clinicId) return;
    return libraryService.subscribeToLibrary(clinicId, 'medicines', setCustomMedicines);
  }, [clinicId]);

  const saveCustomMedicines = (newItems: string[]) => {
    setCustomMedicines(newItems);
    libraryService.saveLibraryItems(clinicId, 'medicines', newItems);
  };


  const [newFollowUp, setNewFollowUp] = useState('');

// Legacy instruction states removed


  // 1. Setup Ref for Date Picker
  const dateRef = useRef<HTMLInputElement>(null);

  // 2. State Binding Logic for Date Picker
  const displayValue = useMemo(() => {
    const val = recommendations.followUpDate || '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      const [d, m, y] = val.split('/');
      return `${y}-${m}-${d}`;
    }
    return '';
  }, [recommendations.followUpDate]);

  // 3. onChange Logic for Date Picker
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value; // yyyy-mm-dd
    if (!date) return;
    const [y, m, d] = date.split('-');
    setRecommendations({ ...recommendations, followUpDate: `${d}/${m}/${y}` });
  };

  // Scroll spy logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: [0.2, 0.5, 0.8], rootMargin: '-10% 0px -40% 0px' });

    const sections = ['diagnoses', 'prescriptions', 'labs'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const [followUpList, setFollowUpList] = useState<string[]>(['5 Days', '1 Week', '2 Weeks', '3 Weeks', '1 Month']);

  useEffect(() => {
    if (!clinicId) return;
    return libraryService.subscribeToLibrary(clinicId, 'followups', (items) => {
      if (items && items.length > 0) {
        setFollowUpList(items);
      }
    });
  }, [clinicId]);

  const saveFollowUpList = (newItems: string[]) => {
    setFollowUpList(newItems);
    libraryService.saveLibraryItems(clinicId, 'followups', newItems);
  };

  const [specialInstructions, setSpecialInstructions] = useState<string[]>([]);

  useEffect(() => {
    if (!clinicId) return;
    const defaults = [
      'ایک صبح ناشتے سے آدھا گھنٹہ پہلے',
      'ایک صبح، دوپہر اور رات کھانے سے آدھا گھنٹہ پہلے',
      'ایک صبح اور رات کھانے سے آدھا گھنٹہ پہلے',
      'دو چمچ صبح، دوپہر اور رات',
      'ایک صبح کھانے کے بعد',
      'ایک دوپہر کھانے کے بعد',
      'ایک رات کھانے کے بعد',
      'ایک صبح اور رات کھانے کے بعد',
      'ایک صبح، دوپہر اور رات کھانے کے بعد',
      'آدھی گولی رات سوتے وقت',
      'آدھی گولی صبح اور آدھی گولی رات کھانے کے بعد',
      'ایک ساشے رات کو پانی میں حل کر کے لیں',
      'ایک ساشے صبح نہار منہ پانی میں حل کر کے لیں',
      'دو سے تین چمچ رات کھانے کے بعد',
      'ایک ٹیکا ہر 15 دن کے بعد پی لیں',
      'ایک ٹیکا ہر ہفتے (مخصوص دن) پی لیں',
      '------- یونٹ صبح -------- یونٹ رات کھانے سے آدھا گھنٹہ پہلے',
      '------- یونٹ صبح -------- یونٹ دوپہر -------- یونٹ رات کھانے سے پہلے',
      'ایک گولی روزانہ رات سونے سے پہلے',
      'ایک گولی ضرورت پڑنے پر (درد یا تکلیف کی صورت میں)'
    ];
    return libraryService.subscribeToLibrary(clinicId, 'instructions', (items) => {
        setSpecialInstructions(items?.length > 0 ? items : defaults);
    });
  }, [clinicId]);

  const saveSpecialInstructions = (newItems: string[]) => {
    setSpecialInstructions(newItems);
    libraryService.saveLibraryItems(clinicId, 'instructions', newItems);
  };


  const [showSaveModal, setShowSaveModal] = useState<'prescription' | 'instruction' | null>(null);
  const [activeInstDropdown, setActiveInstDropdown] = useState<number | null>(null);
  const [showGenInstDropdown, setShowGenInstDropdown] = useState(false);
  const [showMedTemplateDropdown, setShowMedTemplateDropdown] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);

  useEffect(() => {
     if (!clinicId) return;
     const defaults = [
      {
        id: 'viral-flu', name: 'Viral Flu Protocol',
        prescriptions: [
          { medicineName: 'Paracetamol', dosage: '500mg', morning: '1', noon: '1', evening: '1', night: '0', duration: '3 days', instructions: 'After meals' },
          { medicineName: 'Cetirizine', dosage: '10mg', morning: '0', noon: '0', evening: '0', night: '1', duration: '5 days', instructions: 'At bedtime' }
        ]
      },
      {
        id: 'gastritis', name: 'Gastritis / Reflux',
        prescriptions: [
          { medicineName: 'Omeprazole', dosage: '20mg', morning: '1', noon: '0', evening: '0', night: '0', duration: '14 days', instructions: '30 mins before breakfast' },
          { medicineName: 'Domperidone', dosage: '10mg', morning: '1', noon: '0', evening: '1', night: '0', duration: '5 days', instructions: '15 mins before meals' }
        ]
      }
    ];
    return libraryService.subscribeToLibrary(clinicId, 'prescriptionTemplates', (items) => {
        setTemplates(items?.length > 0 ? items : defaults);
    });
  }, [clinicId]);

  const saveTemplates = (newItems: PrescriptionTemplate[]) => {
    setTemplates(newItems);
    libraryService.saveLibraryItems(clinicId, 'prescriptionTemplates', newItems);
  };

  const defaultInstructionTemplates: InstructionTemplate[] = [
    { id: 'gen-1', name: '1۔سینے میں جلن اور وزن زیادہ ہونے کی صورت میں احتیاط', text: 'بستر کے سرہانے والی سائیڈ 6 انچ اونچی رکھیں۔ رات کا کھانا سونے سے 3 گھنٹے پہلے کھائیں۔ کھانا کھانے کے فوراً بعد لیٹنے سے اجتناب کریں۔ سگریٹ نوشی سے مکمل پرہیز کریں۔ وزن مناسب رکھیں۔ تنگ کپڑے نہ پہنیں۔ کچا پیاز، کچا ادرک، تلی ہوئی چیزیں، تیز مرچ مصالحے اور چکنائی سے پرہیز کریں۔ کافی اور کولڈ ڈرنک سے پرہیز کریں۔ چینی، شکر اور چاول سے مکمل پرہیز کریں۔ چھوٹا بڑا گوشت، پھلیاں، دالیں، مٹر، گوبھی اور ٹماٹر سے پرہیز کریں۔ مرغی، مچھلی، آلو، اروی، کدو، ٹنڈے، پالک اور توری کا استعمال کریں۔ صبح و شام کم از کم دو میل پیدل چلیں۔ دوپہر اور رات کے کھانے سے ایک گھنٹہ پہلے مکھن نکلی ہوئی لسی کا ایک گلاس استعمال کریں اس کے بعد ایک چھوٹی چپاتی کے ساتھ کھانا کھائیں۔ چکنائی والے بسکٹ، مٹھائی، چاکلیٹ، حلوہ جات سے پرہیز کریں۔ پھلوں میں سیب، امرود اور کیلے کا استعمال کریں جبکہ مالٹا، لیموں، گریپ فروٹ سے پرہیز کریں۔ باقاعدگی سے نماز ادا کریں۔' },
    { id: 'gen-2', name: '2۔جگر کے سکڑنے (CLD) کی صورت میں احتیاط', text: 'نمک سے مکمل پرہیز کریں۔ اس کے متبادل Rite Salt یا Low Salt کا استعمال کریں۔ دن میں تین سے زیادہ گلاس پانی کسی بھی شکل میں استعمال نہ کریں۔ دن میں 2 انڈوں کی سفیدی، 2 بوٹی گوشت، 2 پیالے دہی اور 2 چمچ آئل ضرور استعمال کریں بوتلیں، ڈبے والے جوس، بیکری کا سامان اور سوڈے والی اشیاء استعمال نہ کریں۔ اپنی کنگھی، ٹوتھ برش اور نیل کٹر علیحدہ رکھیں۔ اکٹھے کھانے پینے سے بچوں کو چومنے سے ایک ہی گھر میں رہنے سے ایک ہی بستر پر لیٹنے سے بیماری نہیں پھیلتی۔ درد کیلئے Panadol کے علاوہ کوئی دوا استعمال نہ کریں۔ اینٹی بائیوٹک ادویات میں Clarithromycin, Tetracycline, Erythromycin, Augmentin وغیرہ استعمال نہ کریں۔ شوگر کی صورت میں چینی، شکر، شہد اور چاول مکمل طور پر بند کر دیں اور قبض نہ ہونے دیں۔ باقاعدگی سے نماز ادا کریں۔' },
    { id: 'gen-3', name: '3۔ ہائی بلڈ پریشر اور دل کے مریضوں کیلئے مفید ہدایات', text: 'اپنا بلڈ پریشر باقاعدگی سے چیک کروائیں۔ نمک کا استعمال کم کریں۔ چکنائی سے بنی ہوئی چیزیں مثلاً پکوڑے، سموسے، تلے ہوئے آلو، تلا ہوا گوشت، کریم مکھن سے پرہیز کریں۔ سبزیوں اور پھلوں کا استعمال زیادہ کریں۔ فائبر سے بھرپور اشیاء استعمال کریں۔ مچھلی کا استعمال کریں۔ مشروبات اور ہائی کیلوریز فوڈز جیسے سافٹ ڈرنک وغیرہ کے استعمال سے پرہیز کریں۔ کم چکنائی کے بغیر ڈیری کی اشیاء کا انتخاب کریں۔ وزن مناسب رکھیں۔ باقاعدگی سے ورزش یا سیر کریں۔ ذہنی دباؤ، فکر یا پریشانی سے بچنے کی کوشش کریں۔ سگریٹ نوشی سے پرہیز کریں۔ باقاعدگی سے نماز ادا کریں۔' },
    { id: 'gen-4', name: '4۔کولیسٹرول اور ٹرائگلیسرائیڈز کم کرنے کے لیے ہدایات', text: 'مناسب خوراک، سبزیوں کا زیادہ استعمال اور باقاعدہ ورزش یا سیر کو اپنا معمول بنائیں۔غذا جس سے پرہیز ضروری ہے:چھوٹا اور بڑا گوشت، خاص کر اعضاء کا گوشت (گردے، کپورے، جگر، مغز وغیرہ) استعمال نہ کریں۔ مکھن، دیسی و بناسپتی گھی، بالائی اور پروسیسڈ میٹ (جیسے ساسیج، نگٹس یا کباب) سے مکمل پرہیز کریں۔ ان سے بنی اشیاء جیسے کیک اور پیسٹری بھی نقصان دہ ہیں۔ خشک میوہ جات میں کشمش اور اخروٹ کے علاوہ دیگر سے پرہیز کریں۔غذا جو کھانی چاہیے :سبزیاں، پھل، گندم، چاول، مکئی اور جو وغیرہ استعمال کریں۔ انڈے کی زردی کو مکمل بند کرنے کے بجائے اسے ہفتے میں 3 بار تک محدود رکھیں، جبکہ انڈے کی سفیدی روزانہ لی جا سکتی ہے۔ کھانا پکانے کے لیے گھی کے بجائے زیتون Pomace olive oil یا سورج مکھی کا تیل یا کینولا آئل (Canola Oil) (کم مقدار میں) استعمال کریں۔' },
    { id: 'gen-5', name: '5۔کمر درد کے مریضوں کے لیے مفید ہدایات', text: 'زیادہ وزن اٹھانے سے پرہیز کریں۔ جھک کر کام کرنے سے گریز کریں اور کام کرتے وقت کمر سیدھی رکھیں۔ زیادہ دیر تک ایک ہی حالت میں بیٹھنے یا کھڑے رہنے سے پرہیز کریں۔ سخت اور سیدھے بستر پر سوئیں اور بہت نرم گدے کے استعمال سے گریز کریں۔ کرسی پر بیٹھتے وقت کمر سیدھی رکھیں اور مناسب سہارا استعمال کریں۔ زمین سے کوئی چیز اٹھاتے وقت کمر کو سیدھا رکھ کر گھٹنوں کو موڑ کر اٹھائیں۔ اگر وزن زیادہ ہو تو وزن کم کرنے کی کوشش کریں۔ روزانہ ہلکی ورزش یا چہل قدمی کریں۔' },
    { id: 'gen-6', name: '6۔ذیابیطس (شوگر) کے مریضوں کیلئے غذائی ہدایات', text: 'دن میں تین بڑے کھانوں کے بجائے تھوڑا تھوڑا اور وقفے وقفے سے کھانا کھائیں۔ کھانے کے اوقات باقاعدہ رکھیں اور کھانا چھوڑنے سے پرہیز کریں۔ میٹھے اور چینی والی اشیاء مثلاً مٹھائیاں، کیک، بسکٹ، کولڈ ڈرنکس اور میٹھے مشروبات سے پرہیز کریں۔ چینی کے بجائے بغیر چینی کے چائے یا کافی استعمال کریں۔چاول، سفید آٹا اور زیادہ نشاستہ والی غذائیں استعمال نہ کریں۔ میدے کی بنی ہوئی اشیاء، بیکری آئٹمز اور فاسٹ فوڈ سے پرہیز کریں۔ گندم کی روٹی، دلیہ، دالیں اور سبزیاں زیادہ استعمال کریں۔پھل مناسب مقدار میں استعمال کریں لیکن بہت زیادہ میٹھے پھل جیسے آم، انگور ،کھجور،کیلااور چیکو کم مقدار میں کھائیں۔ سبزیاں زیادہ استعمال کریں خصوصاً ہری سبزیاں۔ گھی اور تیل کا استعمال کم کریں اور تلی ہوئی غذا سے پرہیز کریں۔ گوشت، مچھلی اور انڈے مناسب مقدار میں استعمال کریں۔ وزن مناسب رکھیں اور روزانہ کم از کم 30 منٹ چہل قدمی یا ہلکی ورزش کریں۔ خون میں شوگر کی سطح باقاعدگی سے چیک کروائیں اور ادویات یا انسولین ڈاکٹر کے مشورے کے مطابق استعمال کریں۔ اگر شوگر بہت زیادہ یا بہت کم ہو جائے تو فوراً ڈاکٹر سے رجوع کریں۔' },
    { id: 'gen-7', name: '7۔وزن کم کرنے کا غذائی چارٹ', text: 'ناشتہ صبح 8 سے 9 بجے کے درمیان دو انڈوں کے آملیٹ (پیاز، ٹماٹر اور کم تیل کے ساتھ) اور بغیر چینی کی چائے یا گرین ٹی سے کرنا چاہیے، جس سے تقریباً 180 کیلوریز حاصل ہوتی ہیں۔ صبح 11 بجے کے قریب درمیانی وقت میں ایک پھل جیسے سیب، امرود یا ناشپاتی لینا مفید ہے، جبکہ دوپہر 2 بجے کے کھانے میں روٹی یا چاول کے بجائے 100 سے 120 گرام گرِلڈ چکن، مچھلی یا ایک پیالی چنے/لوبیا کے ساتھ تازہ سلاد کا استعمال کریں۔ شام 5 بجے کے ہلکے ناشتے میں ایک کپ  پھیکی چائے کے ساتھ ایک وییٹیبل بسکٹ یا 6 سے 8 بادام لیے جا سکتے ہیں۔ رات 8 بجے کے کھانے میں آدھی روٹی کو سبزی یا دال اور تازہ سلاد کے ساتھ کھانا چاہیے تاکہ دن بھر کی کل کیلوریز 750 سے 850 کے درمیان رہیں اور تقریباً 45 سے 50 گرام پروٹین حاصل ہو سکے۔' },
    { id: 'gen-8', name: '8۔جنرل ہدایات :', text: 'ادویات کا استعمال ہمیشہ ڈاکٹر کی ہدایات کے مطابق مقررہ وقت پر کریں اور تمام ادویات پانی کے ساتھ لیں۔ اپنی مرضی سے دوا کی مقدار میں کمی بیشی نہ کریں اور نہ ہی ڈاکٹر کے مشورے کے بغیر کسی دوا کو بند کریں۔ اگر کوئی خوراک بھول جائے تو اسے پورا کرنے کے لیے دوہری مقدار لینے سے گریز کریں۔ علامات میں بہتری کے لیے کم از کم پندرہ دن انتظار کریں، تاہم کسی بھی مسئلے کی صورت میں فوری اپنے معالج سے رابطہ کریں۔ صحت مند زندگی کے لیے متوازن غذا کا استعمال کریں اور خود کو ذہنی فکر یا پریشانی سے دور رکھیں۔' }
  ];

  const [instructionTemplates, setInstructionTemplates] = useState<InstructionTemplate[]>([]);

  useEffect(() => {
    if (!clinicId) return;
    return libraryService.subscribeToLibrary(clinicId, 'instructionTemplates', (items) => {
        setInstructionTemplates(items?.length > 0 ? items : defaultInstructionTemplates);
    });
  }, [clinicId]);

  const saveInstructionTemplates = (newItems: InstructionTemplate[]) => {
    setInstructionTemplates(newItems);
    libraryService.saveLibraryItems(clinicId, 'instructionTemplates', newItems);
  };

  const [customIcdCodes, setCustomIcdCodes] = useState<CustomICDCode[]>([]);

  useEffect(() => {
    if (!clinicId) return;
    return libraryService.subscribeToLibrary(clinicId, 'icdcodes', setCustomIcdCodes);
  }, [clinicId]);

  const saveCustomIcdCodes = (newItems: CustomICDCode[]) => {
    setCustomIcdCodes(newItems);
    libraryService.saveLibraryItems(clinicId, 'icdcodes', newItems);
  };

  const [savedCustomLabs, setSavedCustomLabs] = useState<string[]>([]);
  
  useEffect(() => {
    if (!clinicId) return;
    return libraryService.subscribeToLibrary(clinicId, 'labs', setSavedCustomLabs);
  }, [clinicId]);

  const saveSavedCustomLabs = (newItems: string[]) => {
    setSavedCustomLabs(newItems);
    libraryService.saveLibraryItems(clinicId, 'labs', newItems);
  };

  const [savedCustomImaging, setSavedCustomImaging] = useState<string[]>([]);

  useEffect(() => {
    if (!clinicId) return;
    return libraryService.subscribeToLibrary(clinicId, 'imaging', setSavedCustomImaging);
  }, [clinicId]);

  const saveSavedCustomImaging = (newItems: string[]) => {
    setSavedCustomImaging(newItems);
    libraryService.saveLibraryItems(clinicId, 'imaging', newItems);
  };


  const [imgSearch, setImgSearch] = useState('');
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const [showImgDropdown, setShowImgDropdown] = useState(false);
  const [manualLabInput, setManualLabInput] = useState('');
  const [manualImgInput, setManualImgInput] = useState('');
  const labRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const icdRef = useRef<HTMLDivElement>(null);
  const medRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (labRef.current && !labRef.current.contains(e.target as Node)) setShowLabDropdown(false);
      if (imgRef.current && !imgRef.current.contains(e.target as Node)) setShowImgDropdown(false);
      if (icdRef.current && !icdRef.current.contains(e.target as Node)) { setActiveIcdRow(null); setIcdSearch(''); setActiveIcdSuggestionIndex(-1); }
      if (medRef.current && !medRef.current.contains(e.target as Node)) { setActiveMedRow(null); setMedSearch(''); setActiveMedSuggestionIndex(-1); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addPrescription = () => setPrescriptions([...prescriptions, { medicineName: '', dosage: '', morning: '0', noon: '0', evening: '0', night: '0', duration: '', instructions: '' }]);
  const updatePrescription = (i: number, field: string, value: string) => {
    const updated = [...prescriptions];
    (updated[i] as unknown as Record<string, string>)[field] = value;
    setPrescriptions(updated);
  };
  const removePrescription = (i: number) => setPrescriptions(prescriptions.filter((_, idx) => idx !== i));

  // Diagnosis management
  const addDiagnosisRow = () => {
    setRecommendations({
      ...recommendations,
      diagnoses: [...recommendations.diagnoses, { name: '', icdCode: '' }]
    });
  };
  const updateDiagnosis = (i: number, field: keyof Diagnosis, value: string) => {
    const updated = [...recommendations.diagnoses];
    updated[i] = { ...updated[i], [field]: value };
    setRecommendations({ ...recommendations, diagnoses: updated });
  };
  const removeDiagnosis = (i: number) => {
    setRecommendations({
      ...recommendations,
      diagnoses: recommendations.diagnoses.filter((_, idx) => idx !== i)
    });
  };
  const selectIcdCode = (i: number, code: string, description: string) => {
    const updated = [...recommendations.diagnoses];
    updated[i] = { ...updated[i], icdCode: code, name: description };
    setRecommendations({ ...recommendations, diagnoses: updated });
    setActiveIcdRow(null);
    setIcdSearch('');
    setActiveIcdSuggestionIndex(-1);
  };

  useEffect(() => {
    if (!icdSearch.trim() || activeIcdRow === null) {
      setApiIcdCodes([]);
      return;
    }

    const controller = new AbortController();

    const fetchApi = async () => {
      try {
        const headers = {
          'API-Version': 'v2',
          'Accept': 'application/json',
          'Accept-Language': 'en'
        };

        if (!cachedIcdApiBaseUrl) {
          const relRes = await fetch('http://localhost:8382/icd/release/11/mms', { headers, signal: controller.signal });
          if (relRes.ok) {
            const relData = await relRes.json();
            const relUrl = relData.release[0];
            const parts = relUrl.split('/release/11/');
            if (parts.length > 1) {
              cachedIcdApiBaseUrl = `http://localhost:8382/icd/release/11/${parts[1]}`;
            }
          }
          if (!cachedIcdApiBaseUrl) cachedIcdApiBaseUrl = 'http://localhost:8382/icd/release/11/2025-01/mms';
        }

        const url = `${cachedIcdApiBaseUrl}/search?q=${encodeURIComponent(icdSearch)}`;
        const res = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          if (data.destinationEntities) {
            const results = data.destinationEntities.map((e: any) => ({
              code: e.theCode || 'N/A',
              description: (e.title || '').replace(/<[^>]*>?/gm, ''),
              category: 'WHO ICD-11 API'
            })).filter((e: any) => e.code !== 'N/A');
            setApiIcdCodes(results.slice(0, 30));
          } else {
            setApiIcdCodes([]);
          }
        } else {
          setApiIcdCodes([]);
        }
      } catch (err) {
        setApiIcdCodes([]);
      }
    };

    const timeoutPath = setTimeout(fetchApi, 300);
    return () => {
      clearTimeout(timeoutPath);
      controller.abort();
    };
  }, [icdSearch, activeIcdRow]);

  const allIcdCodes = [...ICD_CODES, ...customIcdCodes];
  const localFilteredIcdCodes = icdSearch.trim()
    ? allIcdCodes.filter(c =>
      c.code.toLowerCase().includes(icdSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(icdSearch.toLowerCase())
    ).slice(0, 30)
    : [];

  const filteredIcdCodes = apiIcdCodes.length > 0 ? apiIcdCodes : localFilteredIcdCodes;

  const allMedicines = [...customMedicines, ...MEDICINES_LIST];
  const filteredMedicines = medSearch.trim()
    ? allMedicines.filter(m => m.toLowerCase().includes(medSearch.toLowerCase())).slice(0, 30)
    : [];

  const allLabTests = [...LAB_CATALOG.flatMap(c => c.tests), ...savedCustomLabs];
  const allImaging = [...IMAGING_CATALOG.flatMap(c => c.studies), ...savedCustomImaging];
  const existingLabs = new Set([...selectedLabs, ...customLabs]);
  const existingImaging = new Set([...selectedImaging, ...customImaging]);

  const filteredLabs = labSearch.trim()
    ? [
      ...LAB_CATALOG.map(c => ({ ...c, tests: c.tests.filter(t => t.toLowerCase().includes(labSearch.toLowerCase()) && !existingLabs.has(t)) })),
      { category: 'Custom Added', tests: savedCustomLabs.filter(t => t.toLowerCase().includes(labSearch.toLowerCase()) && !existingLabs.has(t)) }
    ].filter(c => c.tests.length > 0)
    : [
      ...LAB_CATALOG.map(c => ({ ...c, tests: c.tests.filter(t => !existingLabs.has(t)) })),
      { category: 'Custom Added', tests: savedCustomLabs.filter(t => !existingLabs.has(t)) }
    ].filter(c => c.tests.length > 0);

  const filteredImaging = imgSearch.trim()
    ? [
      ...IMAGING_CATALOG.map(c => ({ ...c, studies: c.studies.filter(s => s.toLowerCase().includes(imgSearch.toLowerCase()) && !existingImaging.has(s)) })),
      { category: 'Custom Added', studies: savedCustomImaging.filter(s => s.toLowerCase().includes(imgSearch.toLowerCase()) && !existingImaging.has(s)) }
    ].filter(c => c.studies.length > 0)
    : [
      ...IMAGING_CATALOG.map(c => ({ ...c, studies: c.studies.filter(s => !existingImaging.has(s)) })),
      { category: 'Custom Added', studies: savedCustomImaging.filter(s => !existingImaging.has(s)) }
    ].filter(c => c.studies.length > 0);

  const addCustomLab = (name: string) => {
    if (name.trim() && !existingLabs.has(name.trim())) {
      setCustomLabs([...customLabs, name.trim()]);
    }
    setLabSearch('');
    setManualLabInput('');
    setShowLabDropdown(false);
  };

  const addCustomImaging = (name: string) => {
    if (name.trim() && !existingImaging.has(name.trim())) {
      setCustomImaging([...customImaging, name.trim()]);
    }
    setImgSearch('');
    setManualImgInput('');
    setShowImgDropdown(false);
  };

  const removeCustomLab = (name: string) => setCustomLabs(customLabs.filter(l => l !== name));
  const removeCustomImaging = (name: string) => setCustomImaging(customImaging.filter(i => i !== name));

  const addLabFromCatalog = (name: string) => {
    if (!existingLabs.has(name)) {
      setCustomLabs([...customLabs, name]);
    }
    setLabSearch('');
    setShowLabDropdown(false);
  };

  const addImagingFromCatalog = (name: string) => {
    if (!existingImaging.has(name)) {
      setCustomImaging([...customImaging, name]);
    }
    setImgSearch('');
    setShowImgDropdown(false);
  };


  // Search logic


  return (
    <>
      <div className="flex gap-8 items-start">
      {/* Sticky Sidebar Navigation */}
      <div className="w-[15%] shrink-0 sticky top-24">
        <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm space-y-1">
          {[
            { id: 'diagnoses', label: 'Diagnoses', icon: '🩺' },
            { id: 'prescriptions', label: 'Prescription Pad', icon: '💊' },
            { id: 'labs', label: 'Labs & Imaging', icon: '🔬' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveSection(item.id);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Quick Summary Card */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <h5 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3">Visit Summary</h5>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-blue-900">
              <span>Diagnoses</span>
              <span>{recommendations.diagnoses.length}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-blue-900">
              <span>Medicines</span>
              <span>{prescriptions.length}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-blue-900">
              <span>Labs & Imaging</span>
              <span>{selectedLabs.length + customLabs.length + selectedImaging.length + customImaging.length}</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
           <button onClick={onNext} className="w-full py-4 bg-green-600 text-white rounded-2xl text-lg font-black shadow-2xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3">
             <span>📄</span> View Report
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-12 pb-24">
        {/* Warnings */}
        {(recommendations.warnings || []).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-black text-red-800 flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span> Clinical Alerts
            </h4>
            <div className="space-y-1">
              {(recommendations.warnings || []).map((w, i) => (
                <p key={i} className="text-sm text-red-700 font-medium">• {w}</p>
              ))}
            </div>
          </div>
        )}
        {/* Diagnoses Section */}
        <section id="diagnoses" className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-none">🩺 Diagnoses</h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">Add patient diagnoses and ICD-11 codes</p>
            </div>
          </div>

          <div className="space-y-4" ref={icdRef}>
            {recommendations.diagnoses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                <span className="text-5xl block mb-4">🩺</span>
                <p className="text-gray-500 font-bold">No diagnoses added yet</p>
                <button onClick={addDiagnosisRow} className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
                   + Add Primary Diagnosis
                </button>
              </div>
            ) : (
              recommendations.diagnoses.map((d, i) => (
                <div key={i} className="group bg-gray-50 border border-gray-200 rounded-2xl p-6 relative hover:border-blue-300 transition-all">
                  <button onClick={() => removeDiagnosis(i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-black transition-all">
                    ×
                  </button>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Diagnosis Description & Code</label>
                      <div className="flex gap-3">
                        <input
                          value={activeIcdRow === i ? icdSearch : (d.icdCode ? `${d.name} - ${d.icdCode}` : d.name)}
                          onChange={e => {
                            setIcdSearch(e.target.value);
                            setActiveIcdRow(i);
                            setActiveIcdSuggestionIndex(-1);
                            updateDiagnosis(i, 'name', e.target.value);
                            updateDiagnosis(i, 'icdCode', '');
                          }}
                          onKeyDown={e => {
                            if (activeIcdRow !== i || !icdSearch.trim() || filteredIcdCodes.length === 0) return;
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setActiveIcdSuggestionIndex(prev => {
                                const next = prev < filteredIcdCodes.length - 1 ? prev + 1 : prev;
                                document.getElementById('icd-option-' + next)?.scrollIntoView({ block: 'nearest' });
                                return next;
                              });
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setActiveIcdSuggestionIndex(prev => {
                                const next = prev > 0 ? prev - 1 : 0;
                                document.getElementById('icd-option-' + next)?.scrollIntoView({ block: 'nearest' });
                                return next;
                              });
                            } else if (e.key === 'Enter' && activeIcdSuggestionIndex >= 0) {
                              e.preventDefault();
                              const selectedIcd = filteredIcdCodes[activeIcdSuggestionIndex];
                              selectIcdCode(i, selectedIcd.code, selectedIcd.description);
                            } else if (e.key === 'Escape') {
                              setActiveIcdRow(null);
                              setActiveIcdSuggestionIndex(-1);
                            }
                          }}
                          onFocus={() => { setActiveIcdRow(i); setIcdSearch(d.icdCode ? `${d.name} - ${d.icdCode}` : d.name); setActiveIcdSuggestionIndex(-1); }}
                          className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-5 py-4 text-base font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                          placeholder="Search diagnosis or type here..."
                        />
                        {activeIcdRow === i && icdSearch.trim() && !allIcdCodes.some(c => c.description.toLowerCase() === icdSearch.trim().toLowerCase() || c.code.toLowerCase() === icdSearch.trim().toLowerCase()) && (
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const parts = icdSearch.split('-');
                              const code = parts.length > 1 ? parts[parts.length - 1].trim() : 'CUSTOM';
                              const desc = parts.length > 1 ? parts.slice(0, -1).join('-').trim() : icdSearch.trim();
                              saveCustomIcdCodes([...customIcdCodes, { code, description: desc, category: 'Custom Added' }]);
                              selectIcdCode(i, code, desc);

                            }}
                            className="px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                          >
                             <span>💾</span> Save
                          </button>
                        )}
                      </div>
                      {activeIcdRow === i && icdSearch.trim() && filteredIcdCodes.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-3 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-80 overflow-y-auto transform origin-top animate-down" id={`icd-dropdown-` + i}>
                          {filteredIcdCodes.map((icd, idx) => (
                            <button key={idx} id={`icd-option-` + idx} onMouseDown={(e) => { e.preventDefault(); selectIcdCode(i, icd.code, icd.description); }}
                              className={`w-full text-left px-5 py-4 flex items-center justify-between transition-all border-b border-gray-50 last:border-0 ${idx === activeIcdSuggestionIndex ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>
                              <div className="flex flex-col">
                                <span className={`text-base font-bold ${idx === activeIcdSuggestionIndex ? 'text-white' : 'text-gray-900'}`}>{icd.description}</span>
                                <span className={`text-xs font-black uppercase tracking-widest ${idx === activeIcdSuggestionIndex ? 'text-blue-100' : 'text-blue-600'}`}>{icd.code}</span>
                              </div>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${idx === activeIcdSuggestionIndex ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{icd.category}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {recommendations.diagnoses.length > 0 && (
              <button onClick={addDiagnosisRow} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                <span className="text-2xl">+</span> Add Another Diagnosis
              </button>
            )}
          </div>
        </section>

        {/* Prescription Pad Section */}
        <section id="prescriptions" className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm scroll-mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-none">💊 Prescription Pad</h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">Add medications and special instructions</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <button onClick={() => setShowMedTemplateDropdown(!showMedTemplateDropdown)}
                  className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all outline-none">
                  ⚡ Load Template
                  <span className="text-[10px]">▼</span>
                </button>
                {showMedTemplateDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMedTemplateDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-72 max-h-80 overflow-y-auto overflow-x-hidden">
                      <div className="p-2 border-b bg-gray-50 text-[10px] font-black uppercase text-gray-400 sticky top-0 z-10">Saved Templates</div>
                      {templates.map(t => (
                        <div key={t.id} className="flex items-stretch border-b border-gray-50 last:border-0 group">
                          <button onClick={() => {
                            setPrescriptions(t.prescriptions.map(p => ({ ...p })));
                            setShowMedTemplateDropdown(false);
                          }}
                            className="flex-1 text-left px-4 py-3 text-xs font-bold text-gray-700 group-hover:bg-blue-50 transition-all truncate pr-2">
                            {t.name}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); saveTemplates(templates.filter(temp => temp.id !== t.id)); }}
                            title="Delete Template"

                            className="px-4 text-red-300 hover:bg-red-50 hover:text-red-500 font-bold transition-all text-sm rounded-r-lg">
                            ×
                          </button>
                        </div>
                      ))}
                      {templates.length === 0 && (
                        <div className="p-4 text-center text-xs font-medium text-gray-400">No saved templates</div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  if (prescriptions.length === 0) return;
                  setTemplateName('');
                  setShowSaveModal('prescription');
                }}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all shadow-md ${prescriptions.length > 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                💾 Save Template
              </button>
            </div>
          </div>

          <div className="space-y-6" ref={medRef}>
            {prescriptions.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                <span className="text-6xl block mb-6">💊</span>
                <p className="text-gray-500 font-bold mb-6">No medications prescribed yet</p>
                <button onClick={addPrescription} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl active:scale-95">
                  + Start Prescribing
                </button>
              </div>
            ) : (
              <>
                {prescriptions.map((p, i) => (
                  <div key={i} className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 transition-all relative">
                    <button onClick={() => removePrescription(i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 text-2xl font-black transition-all">×</button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                      <div className="md:col-span-2 relative">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Medicine Name</label>
                        <input value={activeMedRow === i ? medSearch : p.medicineName}
                          onChange={e => {
                            setMedSearch(e.target.value);
                            setActiveMedRow(i);
                            setActiveMedSuggestionIndex(-1);
                            updatePrescription(i, 'medicineName', e.target.value);
                          }}
                          onKeyDown={e => {
                            if (activeMedRow !== i || !medSearch.trim() || filteredMedicines.length === 0) return;
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setActiveMedSuggestionIndex(prev => {
                                const next = prev < filteredMedicines.length - 1 ? prev + 1 : prev;
                                document.getElementById('med-option-' + next)?.scrollIntoView({ block: 'nearest' });
                                return next;
                              });
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setActiveMedSuggestionIndex(prev => {
                                const next = prev > 0 ? prev - 1 : 0;
                                document.getElementById('med-option-' + next)?.scrollIntoView({ block: 'nearest' });
                                return next;
                              });
                            } else if (e.key === 'Enter' && activeMedSuggestionIndex >= 0) {
                              e.preventDefault();
                              updatePrescription(i, 'medicineName', filteredMedicines[activeMedSuggestionIndex]);
                              setActiveMedRow(null);
                              setMedSearch('');
                              setActiveMedSuggestionIndex(-1);
                            }
                          }}
                          onFocus={() => { setActiveMedRow(i); setMedSearch(p.medicineName); setActiveMedSuggestionIndex(-1); }}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-base font-bold outline-none focus:bg-white focus:border-blue-600 transition-all" />
                        
                        {(activeMedRow === i && medSearch.trim() && !allMedicines.some(m => m.toLowerCase() === medSearch.toLowerCase())) && (
                          <button 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const val = medSearch.trim();
                              saveCustomMedicines([...customMedicines, val]);
                              updatePrescription(i, 'medicineName', val);
                              setActiveMedRow(null);
                              setMedSearch('');
                            }}
                            className="absolute z-[60] top-[105%] left-0 right-0 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-between hover:bg-emerald-100 transition-all shadow-xl group"
                          >
                            <div className="flex flex-col items-start">
                              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">New Medicine</span>
                              <span className="text-sm font-bold text-gray-800">{medSearch}</span>
                            </div>
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-lg group-hover:scale-110 transition-transform">SAVE & ADD</span>
                          </button>
                        )}

                        
                        {activeMedRow === i && medSearch.trim() && filteredMedicines.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden">
                            {filteredMedicines.map((med, idx) => (
                              <button key={idx} id={`med-option-` + idx} onMouseDown={(e) => {
                                e.preventDefault();
                                updatePrescription(i, 'medicineName', med);
                                setActiveMedRow(null);
                                setMedSearch('');
                                setActiveMedSuggestionIndex(-1);
                              }}
                                className={`w-full text-left px-5 py-3 text-sm font-bold transition-all border-b border-gray-50 last:border-0 ${idx === activeMedSuggestionIndex ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`}>
                                {med}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Dosage</label>
                        <input value={p.dosage} onChange={e => updatePrescription(i, 'dosage', e.target.value)}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-base font-bold outline-none focus:bg-white focus:border-blue-600 transition-all" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 block text-center">Timing</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'morning', icon: '🌅', urdu: 'صبح' },
                            { id: 'noon', icon: '☀️', urdu: 'دوپہر' },
                            { id: 'evening', icon: '🌇', urdu: 'شام' },
                            { id: 'night', icon: '🌙', urdu: 'رات' }
                          ].map(time => (
                            <div key={time.id} className="flex flex-col items-center">
                              <span className="text-sm mb-1" title={time.id}>{time.icon}</span>
                              <input list="dose-options" value={(p as any)[time.id]} 
                                onChange={e => updatePrescription(i, time.id, e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-2 px-1 text-center text-sm font-black outline-none focus:bg-white focus:border-blue-600 transition-all" />
                              <span className="text-[11px] font-urdu text-gray-500 mt-1">{time.urdu}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Duration</label>
                        <input value={p.duration} onChange={e => updatePrescription(i, 'duration', e.target.value)}
                          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-base font-bold outline-none focus:bg-white focus:border-blue-600 transition-all" />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-4 items-center border-t border-gray-50 pt-4">
                      <div className="flex-1 w-full flex items-center gap-2">
                         <input value={p.instructions} onChange={e => updatePrescription(i, 'instructions', e.target.value)}
                          className="flex-1 bg-blue-50 border-2 border-blue-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-blue-600 transition-all" 
                          placeholder="Special instructions (e.g., Take with milk)" />
                         <SpeechMicButton compact onResult={(text) => updatePrescription(i, 'instructions', (p.instructions ? p.instructions + ' ' : '') + text)} />
                      </div>
                      <div className="flex gap-2 shrink-0 w-full md:w-auto">
                        <button onClick={() => {
                          const val = p.instructions.trim();
                          if (val && !specialInstructions.includes(val)) {
                            saveSpecialInstructions([...specialInstructions, val]);
                          }
                        }} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-100 transition-all">


                          💾 Save
                        </button>
                        <div className="relative flex-1 md:w-48">
                          <button onClick={() => setActiveInstDropdown(activeInstDropdown === i ? null : i)}
                            className="w-full bg-white border-2 border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-all flex items-center justify-between shadow-sm">
                            <span className="truncate">Load Saved...</span>
                            <span className="text-[10px]">▼</span>
                          </button>
                          {activeInstDropdown === i && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveInstDropdown(null)} />
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-64 max-h-60 overflow-y-auto overflow-x-hidden">
                                <div className="p-2 border-b bg-gray-50 text-[10px] font-black uppercase text-gray-400 sticky top-0 z-10">Saved Presets</div>
                                {specialInstructions.map((inst, idx) => (
                                  <div key={'inst'+idx} className="flex items-stretch border-b border-gray-50 last:border-0 group">
                                    <button onClick={() => { updatePrescription(i, 'instructions', inst); setActiveInstDropdown(null); }}
                                      className="flex-1 text-left px-4 py-2 text-xs font-bold text-gray-700 group-hover:bg-blue-50 transition-all truncate pr-2">
                                      {inst}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); saveSpecialInstructions(specialInstructions.filter(item => item !== inst)); }}
                                      title="Delete Preset"

                                      className="px-3 text-red-300 hover:bg-red-50 hover:text-red-500 font-bold transition-all text-sm rounded-r-lg">
                                      ×
                                    </button>
                                  </div>
                                ))}
                                {specialInstructions.length === 0 && (
                                  <div className="p-4 text-center text-xs font-medium text-gray-400">No saved presets</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={addPrescription} className="w-full py-6 border-2 border-dashed border-blue-200 text-blue-500 rounded-2xl font-black hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-3">
                  <span className="text-3xl">+</span> PRESCRIBE ANOTHER MEDICINE
                </button>
              </>
            )}
          </div>

          {/* Follow-Up & General Instructions Integrated */}
          <div className="mt-12 border-t-2 border-gray-50 pt-10 space-y-10">
            {/* General Instructions */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">📝</span> Instructions
                </h4>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={() => setShowGenInstDropdown(!showGenInstDropdown)}
                      className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2.5 rounded-lg transition-all outline-none">
                      ⚡ Load Templates
                      <span className="text-[10px]">▼</span>
                    </button>
                    {showGenInstDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowGenInstDropdown(false)} />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-72 max-h-80 overflow-y-auto overflow-x-hidden">
                          <div className="p-2 border-b bg-gray-50 text-[10px] font-black uppercase text-gray-400 sticky top-0 z-10">Saved Templates</div>
                          {instructionTemplates.map(t => (
                            <div key={t.id} className="flex items-stretch border-b border-gray-50 last:border-0 group">
                              <button onClick={() => {
                                const current = (recommendations.instructions || '').trim();
                                setRecommendations({ ...recommendations, instructions: current ? current + '\n' + t.text : t.text });
                                setShowGenInstDropdown(false);
                              }}
                                className="flex-1 text-left px-4 py-2 text-xs font-bold text-gray-700 group-hover:bg-blue-50 transition-all truncate pr-2">
                                {t.name}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setInstructionTemplates(instructionTemplates.filter(temp => temp.id !== t.id)); }}
                                title="Delete Template"
                                className="px-3 text-red-300 hover:bg-red-50 hover:text-red-500 font-bold transition-all text-sm rounded-r-lg">
                                ×
                              </button>
                            </div>
                          ))}
                          {instructionTemplates.length === 0 && (
                            <div className="p-4 text-center text-xs font-medium text-gray-400">No saved templates</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (!recommendations.instructions?.trim()) return;
                      setTemplateName('');
                      setShowSaveModal('instruction');
                    }}
                    className={`text-xs font-black px-3 py-2.5 rounded-lg transition-all shadow-sm ${recommendations.instructions?.trim() ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    💾 Save 
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">Dictate or type instructions below</span>
                  <SpeechMicButton onResult={(text) => setRecommendations({ ...recommendations, instructions: ((recommendations.instructions || '').trim() ? (recommendations.instructions || '').trim() + ' ' : '') + text })} />
                </div>
                <textarea value={recommendations.instructions || ''}
                  onChange={e => setRecommendations({ ...recommendations, instructions: e.target.value })}
                  rows={4} dir="rtl"
                  className="w-full bg-gray-50 border-2 border-orange-100 rounded-2xl p-4 text-lg font-urdu text-right leading-relaxed focus:bg-white focus:border-orange-400 outline-none transition-all shadow-inner"
                  placeholder="مریض کے لیے خصوصی ہدایات یہاں لکھیں... (or use 🎤 mic)" />
              </div>
            </div>

            {/* Follow-Up Plan */}
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h4 className="text-base font-black text-blue-900 flex items-center gap-2">
                  <span className="text-xl">📅</span> Follow-Up Plan
                  {/* Integrated Date Picker Toggle */}
                  <div className="flex items-center ml-2 border-l border-blue-200 pl-3">
                    <input
                      type="date"
                      ref={dateRef}
                      value={displayValue}
                      onChange={handleDateChange}
                      className="opacity-0 absolute w-0 h-0 pointer-events-none"
                    />
                    <button
                      onClick={() => dateRef.current?.showPicker()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[11px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <span>📅</span> Select Date
                    </button>
                    {displayValue && (
                      <span className="ml-2 text-[10px] font-black text-blue-500 uppercase">
                        {recommendations.followUpDate}
                      </span>
                    )}
                  </div>
                </h4>
                <div className="flex items-center gap-2">
                  <input value={newFollowUp} onChange={e => setNewFollowUp(e.target.value)}
                    className="w-48 bg-white border-2 border-blue-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-600 transition-all" placeholder="New preset..." />
                  <button onClick={() => {
                    const val = newFollowUp.trim();
                    if (!val) return;
                    if (!followUpList.some(f => f.toLowerCase() === val.toLowerCase())) saveFollowUpList([...followUpList, val]);
                    setRecommendations({ ...recommendations, followUpDate: val });
                    setNewFollowUp('');

                  }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-all shrink-0">
                    Add
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  {followUpList.map(period => (
                    <div key={period} className="relative group flex items-stretch">
                      <button onClick={() => setRecommendations({ ...recommendations, followUpDate: period })}
                        className={`px-3 py-1.5 rounded-l-lg text-xs font-bold border-2 border-r-0 transition-all ${recommendations.followUpDate === period ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-blue-100 text-blue-700 hover:border-blue-300'}`}>
                        {period}
                      </button>
                      <button onClick={() => saveFollowUpList(followUpList.filter(p => p !== period))}
                        className={`px-2 flex items-center justify-center rounded-r-lg border-2 border-l border-blue-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-bold ${recommendations.followUpDate === period ? 'bg-blue-600 border-blue-600 border-l-blue-500 text-white' : 'bg-white text-gray-400'}`}>

                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input type="text" value={recommendations.followUpDate || ''}
                  onChange={e => setRecommendations({ ...recommendations, followUpDate: e.target.value })}
                  className="w-full bg-white border-2 border-blue-200 rounded-xl px-4 py-3 text-sm font-bold text-blue-900 focus:bg-blue-50 outline-none focus:border-blue-500 transition-all"
                  placeholder="Specific follow-up date or instructions..." />
              </div>
            </div>
          </div>
        </section>

        {/* Labs & Imaging Section */}
        <section id="labs" className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-none">🔬 Investigations</h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">Select laboratory tests and imaging studies</p>
            </div>
          </div>

          <div className="space-y-12">
            {/* Laboratory Tests */}
            <div className="bg-emerald-50/30 rounded-3xl p-8 border border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-lg">🧪</span> Laboratory Tests
                </h4>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedLabs(recommendations.labTests.map(l => l.name))} className="text-[10px] font-black text-emerald-600 hover:bg-emerald-100/50 px-2 py-1 rounded transition-all uppercase tracking-wider">Select All</button>
                  <button onClick={() => setSelectedLabs([])} className="text-[10px] font-black text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-all uppercase tracking-wider">Deselect All</button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {[...recommendations.labTests.map(l => ({ name: l.name, system: true })), ...customLabs.map(l => ({ name: l, system: false }))].map((lab, i) => {
                  const isSelected = selectedLabs.includes(lab.name) || !lab.system;
                  return (
                    <button key={i} onClick={() => lab.system && setSelectedLabs(isSelected ? selectedLabs.filter(l => l !== lab.name) : [...selectedLabs, lab.name])}
                      className={`px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all flex items-center gap-2 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-emerald-100 text-emerald-300 opacity-60 line-through'}`}>
                      {isSelected && <span>✓</span>} {lab.name}
                      {!lab.system && <span onClick={(e) => { e.stopPropagation(); removeCustomLab(lab.name); }} className="ml-2 hover:text-red-200">×</span>}
                    </button>
                  );
                })}
              </div>

              <div className="relative" ref={labRef}>
                <div className="flex gap-3">
                  <input value={showLabDropdown ? labSearch : manualLabInput}
                    onChange={e => showLabDropdown ? setLabSearch(e.target.value) : setManualLabInput(e.target.value)}
                    onFocus={() => { setShowLabDropdown(true); setLabSearch(manualLabInput); }}
                    className="flex-1 bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 text-base font-bold outline-none focus:border-emerald-500 transition-all font-sans" placeholder="🔍 Search or type medical tests..." />
                  <button onClick={() => {
                      const val = (showLabDropdown ? labSearch : manualLabInput).trim();
                      if (val && !allLabTests.includes(val)) {
                        saveSavedCustomLabs([...savedCustomLabs, val]);
                      }
                      addCustomLab(val);
                    }}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95">Add</button>

                </div>
                {showLabDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-3 bg-white border-2 border-emerald-50 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                    {filteredLabs.map((cat, ci) => (
                      <div key={ci}>
                        <div className="px-5 py-3 bg-emerald-50 text-[10px] font-black text-emerald-800 uppercase tracking-widest sticky top-0">{cat.category}</div>
                        {cat.tests.map((test, ti) => (
                          <button key={ti} onClick={() => addLabFromCatalog(test)}
                            className="w-full text-left px-6 py-4 text-sm font-bold text-gray-700 hover:bg-emerald-50 transition-colors flex items-center justify-between">
                            {test}
                            <span className="text-[10px] font-black uppercase text-emerald-600">+ Add</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Imaging Studies */}
            <div className="bg-cyan-50/30 rounded-3xl p-8 border border-cyan-100">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-cyan-800 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-lg">📸</span> Imaging Studies
                </h4>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedImaging(recommendations.imagingStudies.map(s => s.name))} className="text-[10px] font-black text-cyan-600 hover:bg-cyan-100/50 px-2 py-1 rounded transition-all uppercase tracking-wider">Select All</button>
                  <button onClick={() => setSelectedImaging([])} className="text-[10px] font-black text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-all uppercase tracking-wider">Deselect All</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {[...recommendations.imagingStudies.map(s => ({ name: s.name, system: true })), ...customImaging.map(i => ({ name: i, system: false }))].map((img, i) => {
                  const isSelected = selectedImaging.includes(img.name) || !img.system;
                  return (
                    <button key={i} onClick={() => img.system && setSelectedImaging(isSelected ? selectedImaging.filter(s => s !== img.name) : [...selectedImaging, img.name])}
                      className={`px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all flex items-center gap-2 ${isSelected ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg' : 'bg-white border-cyan-100 text-cyan-300 opacity-60 line-through'}`}>
                      {isSelected && <span>✓</span>} {img.name}
                      {!img.system && <span onClick={(e) => { e.stopPropagation(); removeCustomImaging(img.name); }} className="ml-2 hover:text-red-200">×</span>}
                    </button>
                  );
                })}
              </div>

              <div className="relative" ref={imgRef}>
                <div className="flex gap-3">
                  <input value={showImgDropdown ? imgSearch : manualImgInput}
                    onChange={e => showImgDropdown ? setImgSearch(e.target.value) : setManualImgInput(e.target.value)}
                    onFocus={() => { setShowImgDropdown(true); setImgSearch(manualImgInput); }}
                    className="flex-1 bg-white border-2 border-cyan-100 rounded-2xl px-6 py-4 text-base font-bold outline-none focus:border-cyan-500 transition-all font-sans" placeholder="🔍 Search or type imaging (X-Ray, MRI, Ultrasound)..." />
                  <button onClick={() => {
                      const val = (showImgDropdown ? imgSearch : manualImgInput).trim();
                      if (val && !allImaging.includes(val)) {
                        saveSavedCustomImaging([...savedCustomImaging, val]);
                      }
                      addCustomImaging(val);
                    }}
                    className="px-8 py-4 bg-cyan-600 text-white rounded-2xl font-black shadow-lg hover:bg-cyan-700 transition-all active:scale-95">Add</button>

                </div>
                {showImgDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-3 bg-white border-2 border-cyan-50 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                    {filteredImaging.map((cat, ci) => (
                      <div key={ci}>
                        <div className="px-5 py-3 bg-cyan-50 text-[10px] font-black text-cyan-800 uppercase tracking-widest sticky top-0">{cat.category}</div>
                        {cat.studies.map((study, si) => (
                          <button key={si} onClick={() => addImagingFromCatalog(study)}
                            className="w-full text-left px-6 py-4 text-sm font-bold text-gray-700 hover:bg-cyan-50 transition-colors flex items-center justify-between">
                            {study}
                            <span className="text-[10px] font-black uppercase text-cyan-600">+ Add</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>



      {/* Summary & Next */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {recommendations.diagnoses.length} diagnoses • {prescriptions.length} medicines • {selectedLabs.length + customLabs.length} lab tests • {selectedImaging.length + customImaging.length} imaging
        </div>
        <button onClick={onNext} className="px-8 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all">
          📄 View Report →
        </button>
        </div> {/* matches 1131 summary block */}
        </div> {/* matches 514 flex-1 column */}
      </div> {/* matches 465 flex root container */}



      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowSaveModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {showSaveModal === 'prescription' ? '💾 Save Prescription Template' : '💾 Save Instruction Template'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {showSaveModal === 'prescription'
                ? `Save ${prescriptions.length} medication(s) as a reusable template.`
                : 'Save these instructions as a reusable template.'}
            </p>
            <input
              autoFocus
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && templateName.trim()) {
                  const tName = templateName.trim();
                  if (showSaveModal === 'prescription') {
                    const existing = templates.find(t => t.name.toLowerCase() === tName.toLowerCase());
                    if (existing) {
                      saveTemplates(templates.map(t => t.id === existing.id ? { ...t, prescriptions: prescriptions.map(p => ({ ...p })) } : t));
                    } else {
                      saveTemplates([...templates, { id: 'tpl-' + Date.now(), name: tName, prescriptions: prescriptions.map(p => ({ ...p })) }]);
                    }
                  } else {
                    const existing = instructionTemplates.find(t => t.name.toLowerCase() === tName.toLowerCase());
                    if (existing) {
                      saveInstructionTemplates(instructionTemplates.map(t => t.id === existing.id ? { ...t, text: recommendations.instructions } : t));
                    } else {
                      saveInstructionTemplates([...instructionTemplates, { id: 'inst-' + Date.now(), name: tName, text: recommendations.instructions }]);
                    }
                  }

                  setShowSaveModal(null);
                  setTemplateName('');
                }
              }}
              className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
              placeholder={showSaveModal === 'prescription' ? 'e.g., Asthma Protocol, Diabetes Regimen...' : 'e.g., Diabetic Diet Instructions...'}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowSaveModal(null); setTemplateName(''); }}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!templateName.trim()) return;
                  const tName = templateName.trim();
                  if (showSaveModal === 'prescription') {
                    const existing = templates.find(t => t.name.toLowerCase() === tName.toLowerCase());
                    if (existing) {
                      saveTemplates(templates.map(t => t.id === existing.id ? { ...t, prescriptions: prescriptions.map(p => ({ ...p })) } : t));
                    } else {
                      saveTemplates([...templates, { id: 'tpl-' + Date.now(), name: tName, prescriptions: prescriptions.map(p => ({ ...p })) }]);
                    }
                  } else {
                    const existing = instructionTemplates.find(t => t.name.toLowerCase() === tName.toLowerCase());
                    if (existing) {
                      saveInstructionTemplates(instructionTemplates.map(t => t.id === existing.id ? { ...t, text: recommendations.instructions } : t));
                    } else {
                      saveInstructionTemplates([...instructionTemplates, { id: 'inst-' + Date.now(), name: tName, text: recommendations.instructions }]);
                    }
                  }

                  setShowSaveModal(null);
                  setTemplateName('');
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${templateName.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                💾 Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
