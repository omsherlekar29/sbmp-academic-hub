export const TIME_SLOTS = ['08:00 - 09:00','09:00 - 10:00','10:00 - 11:00','11:00 - 12:00','12:00 - 01:00','01:00 - 02:00','02:00 - 03:00','03:00 - 04:00','04:00 - 05:00'];
export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// Lab is stored in BOTH hours it runs. The table code detects the pair
// and merges them into a single 2-row-tall cell using rowspan=2.

export const TIMETABLE_DIV_B = {
 Monday:{
  '08:00 - 09:00':{type:'FREE'},
  '09:00 - 10:00':{type:'FREE'},
  '10:00 - 11:00':{type:'FREE'},
  '11:00 - 12:00':{type:'FREE'},
  '12:00 - 01:00':{type:'CLASS',code:'FCS260801',name:'Fundamentals of Computing System',mode:'CL',faculty:'RVP',room:'CR-206',batch:'ALL'},
  '01:00 - 02:00':{type:'RECESS'},
  '02:00 - 03:00':{type:'CLASS',code:'CMS268903',name:'Communication Skills',mode:'CL',faculty:'PSA',room:'CR-105',batch:'ALL'},
  '03:00 - 04:00':{type:'CLASS',code:'ASC268902',name:'Applied Science',mode:'CL',faculty:'SKT',room:'CR-105',batch:'ALL'},
  '04:00 - 05:00':{type:'CLASS',code:'ASC268902',name:'Applied Science',mode:'CL',faculty:'SKT',room:'CR-105',batch:'ALL'}
 },
 Tuesday:{
  '08:00 - 09:00':{type:'CLASS',code:'EMT268901',name:'Engineering Mathematics',mode:'CL',faculty:'KD',room:'CR-106',batch:'ALL'},
  '09:00 - 10:00':{type:'CLASS',code:'ASC268902',name:'Applied Science',mode:'CL',faculty:'SKT',room:'CR-106',batch:'ALL'},
  // ----- Tue 10-12 lab block -----
  '10:00 - 11:00':[
    {type:'CLASS',code:'ENG268904',name:'Engineering Graphics',mode:'LL',faculty:'VF',room:'Computer Lab 5',batch:'S1'},
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'GS',room:'Computer Lab 3',batch:'S2'}
  ],
  '11:00 - 12:00':[
    {type:'CLASS',code:'ENG268904',name:'Engineering Graphics',mode:'LL',faculty:'VF',room:'Computer Lab 5',batch:'S1'},
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'GS',room:'Computer Lab 3',batch:'S2'}
  ],
  // ----- -----
  '12:00 - 01:00':{type:'RECESS'},
  '01:00 - 02:00':{type:'CLASS',code:'UHV268905',name:'Universal Human Values',mode:'CL',faculty:'PPB',room:'CR-106',batch:'ALL'},
  '02:00 - 03:00':{type:'CLASS',code:'CMS268903',name:'Communication Skills',mode:'CL',faculty:'PSA',room:'CR-206',batch:'ALL'},
  '03:00 - 04:00':{type:'CLASS',code:'EMT268901',name:'Engineering Mathematics',mode:'CL',faculty:'KD',room:'CR-105',batch:'ALL'},
  '04:00 - 05:00':{type:'FREE'}
 },
 Wednesday:{
  // ----- Wed 08-10 lab block -----
  '08:00 - 09:00':[
    {type:'CLASS',code:'ASC268902',name:'Applied Science',mode:'LL',faculty:'SKT',room:'APH Lab',batch:'S1'},
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'GS',room:'Computer Lab 3',batch:'S2'}
  ],
  '09:00 - 10:00':[
    {type:'CLASS',code:'ASC268902',name:'Applied Science',mode:'LL',faculty:'SKT',room:'APH Lab',batch:'S1'},
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'GS',room:'Computer Lab 3',batch:'S2'}
  ],
  // ----- Wed 10-12 lab block -----
  '10:00 - 11:00':[
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'PHS',room:'Computer Lab 3',batch:'S1'},
    {type:'CLASS',code:'FCS260801',name:'Fundamentals of Computing System',mode:'LL',faculty:'PN',room:'Computer Lab 5',batch:'S2'}
  ],
  '11:00 - 12:00':[
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'PHS',room:'Computer Lab 3',batch:'S1'},
    {type:'CLASS',code:'FCS260801',name:'Fundamentals of Computing System',mode:'LL',faculty:'PN',room:'Computer Lab 5',batch:'S2'}
  ],
  // ----- -----
  '12:00 - 01:00':{type:'RECESS'},
  '01:00 - 02:00':{type:'CLASS',code:'ENG268904',name:'Engineering Graphics',mode:'CL',faculty:'VF',room:'CR-106',batch:'ALL'},
  '02:00 - 03:00':{type:'CLASS',code:'EMT268901',name:'Engineering Mathematics',mode:'TL',faculty:'KD',room:'CR-106',batch:'ALL'},
  '03:00 - 04:00':{type:'CLASS',code:'CMS268903',name:'Communication Skills',mode:'TL',faculty:'PSA',room:'CR-106 / Language Lab',batch:'ALL'},
  '04:00 - 05:00':{type:'FREE'}
 },
 Thursday:{
  '08:00 - 09:00':{type:'FREE'},
  '09:00 - 10:00':{type:'FREE'},
  '10:00 - 11:00':{type:'FREE'},
  '11:00 - 12:00':{type:'FREE'},
  '12:00 - 01:00':{type:'FREE'},
  '01:00 - 02:00':{type:'CLASS',code:'CMS268903',name:'Communication Skills',mode:'CL',faculty:'PSA',room:'CR-106',batch:'ALL'},
  // ----- Thu 02-04 lab block -----
  '02:00 - 03:00':[
    {type:'CLASS',code:'FCS260801',name:'Fundamentals of Computing System',mode:'LL',faculty:'PN',room:'Computer Lab 3',batch:'S1'},
    {type:'CLASS',code:'ENG268904',name:'Engineering Graphics',mode:'LL',faculty:'VF2',room:'Computer Lab 5',batch:'S2'}
  ],
  '03:00 - 04:00':[
    {type:'CLASS',code:'FCS260801',name:'Fundamentals of Computing System',mode:'LL',faculty:'PN',room:'Computer Lab 3',batch:'S1'},
    {type:'CLASS',code:'ENG268904',name:'Engineering Graphics',mode:'LL',faculty:'VF2',room:'Computer Lab 5',batch:'S2'}
  ],
  // ----- -----
  '04:00 - 05:00':{type:'CLASS',code:'FCS260801',name:'Fundamentals of Computing System',mode:'CL',faculty:'RVP',room:'CR-302',batch:'ALL'}
 },
 Friday:{
  // ----- Fri 08-10 lab block -----
  '08:00 - 09:00':[
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'PHS',room:'Computer Lab 3',batch:'S1'},
    {type:'CLASS',code:'ASC268902',name:'Applied Science',mode:'LL',faculty:'SKT',room:'APH Lab',batch:'S2'}
  ],
  '09:00 - 10:00':[
    {type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'LL',faculty:'PHS',room:'Computer Lab 3',batch:'S1'},
    {type:'CLASS',code:'ASC268902',name:'Applied Science',mode:'LL',faculty:'SKT',room:'APH Lab',batch:'S2'}
  ],
  // ----- -----
  '10:00 - 11:00':{type:'CLASS',code:'ENG268904',name:'Engineering Graphics',mode:'CL',faculty:'VF',room:'CR-106',batch:'ALL'},
  '11:00 - 12:00':{type:'CLASS',code:'EMT268901',name:'Engineering Mathematics',mode:'CL',faculty:'KD',room:'CR-106',batch:'ALL'},
  '12:00 - 01:00':{type:'LIBRARY'},
  '01:00 - 02:00':{type:'RECESS'},
  '02:00 - 03:00':{type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'CL',faculty:'PHS',room:'CR-106',batch:'ALL'},
  '03:00 - 04:00':{type:'CLASS',code:'UHV268905',name:'Universal Human Values',mode:'TL',faculty:'PPB',room:'CR-106',batch:'ALL'},
  '04:00 - 05:00':{type:'CLASS',code:'UHV268905',name:'Universal Human Values',mode:'CL',faculty:'PPB',room:'CR-106',batch:'ALL'}
 },
 Saturday:{
  '08:00 - 09:00':{type:'CLASS',code:'EMT268901',name:'Engineering Mathematics',mode:'TL',faculty:'KD',room:'CR-105',batch:'ALL'},
  '09:00 - 10:00':{type:'CLASS',code:'EMT268901',name:'Engineering Mathematics',mode:'TL',faculty:'KD',room:'CR-105',batch:'ALL'},
  '10:00 - 11:00':{type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'CL',faculty:'PHS',room:'CR-106',batch:'ALL'},
  '11:00 - 12:00':{type:'CLASS',code:'WSD260802',name:'Website Designing',mode:'CL',faculty:'PHS',room:'CR-106',batch:'ALL'},
  '12:00 - 01:00':{type:'FREE'},
  '01:00 - 02:00':{type:'FREE'},
  '02:00 - 03:00':{type:'FREE'},
  '03:00 - 04:00':{type:'FREE'},
  '04:00 - 05:00':{type:'FREE'}
 }
};

export const SUBJECT_COLORS = {
 EMT268901:'#1e40af', ASC268902:'#047857', CMS268903:'#b45309',
 ENG268904:'#7c3aed', FCS260801:'#0369a1', UHV268905:'#be123c', WSD260802:'#0f766e'
};
export const MODE_LABEL = { CL:'Lecture', TL:'Tutorial', LL:'Lab', SL:'Self Learning' };