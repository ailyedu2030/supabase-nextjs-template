
import { createClient } from '@supabase/supabase-js';

const url = 'https://hqfgrxhkddbkzmihmrmz.supabase.co';
const key = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(url, key);

async function generateMultipleChoiceQuestions() {
  console.log('Fetching vocabulary...');
  const { data: vocabulary, error: vocabError } = await supabase
    .from('vocabulary')
    .select('id, word, translation, definition, part_of_speech');

  if (vocabError) {
    console.error('Error fetching vocabulary:', vocabError);
    return;
  }

  console.log(`Found ${vocabulary.length} vocabulary words`);

  // Prepare all translations and definitions
  const allTranslations = vocabulary
    .filter(v => v.translation)
    .map(v => v.translation);
  const allDefinitions = vocabulary
    .filter(v => v.definition)
    .map(v => v.definition);

  const questionsToInsert = [];
  const batchSize = 100;

  for (const vocab of vocabulary) {
    if (!vocab.translation && !vocab.definition) {
      continue;
    }

    const useTranslation = !!vocab.translation;
    const correctAnswer = useTranslation ? vocab.translation : vocab.definition;
    const sourceList = useTranslation ? allTranslations : allDefinitions;

    // Generate 3 distractors
    const distractors = [];
    while (distractors.length < 3) {
      const distractor = sourceList[Math.floor(Math.random() * sourceList.length)];
      if (distractor !== correctAnswer && !distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }

    // Combine and shuffle options
    const options = [correctAnswer, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const question = {
      training_type: 'vocabulary',
      question_type: 'multiple_choice',
      title: `Vocabulary: ${vocab.word}`,
      content: `请选择 "${vocab.word}" 的正确${useTranslation ? '中文意思' : '英文释义'}：`,
      difficulty_level: vocab.difficulty_level || 3,
      max_score: 10.0,
      knowledge_points: vocab.part_of_speech ? [vocab.part_of_speech] : [],
      tags: ['vocabulary', 'CET-4', 'multiple-choice'],
      correct_answer: JSON.stringify(options),
      answer_analysis: `"${vocab.word}" 的${useTranslation ? '中文意思' : '英文释义'}是：${correctAnswer}`,
      vocabulary_id: vocab.id,
    };

    questionsToInsert.push(question);

    // Insert in batches
    if (questionsToInsert.length >= batchSize) {
      console.log(`Inserting ${questionsToInsert.length} questions...`);
      const { error: insertError } = await supabase
        .from('questions')
        .insert(questionsToInsert);
      
      if (insertError) {
        console.error('Error inserting questions:', insertError);
        return;
      }
      
      questionsToInsert.length = 0;
    }
  }

  // Insert remaining questions
  if (questionsToInsert.length > 0) {
    console.log(`Inserting remaining ${questionsToInsert.length} questions...`);
    const { error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert);
    
    if (insertError) {
      console.error('Error inserting remaining questions:', insertError);
      return;
    }
  }

  console.log('Done generating questions!');
}

generateMultipleChoiceQuestions().catch(console.error);
