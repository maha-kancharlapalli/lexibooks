-- ═══════════════════════════════════════════════════════════
--  LEXIBOOKS — seed data
--  Run after schema.sql. Re-runnable: existing titles are skipped.
--
--  Titles, authors, quotes, genres and cover URLs are taken from
--  the live site. Tropes, moods, age ranges and page counts are a
--  FIRST PASS ONLY — they are editorial calls your team should
--  correct in the Supabase table editor.
-- ═══════════════════════════════════════════════════════════

insert into books
  (title, author, genre, tropes, moods, formats, quote, age_min, age_max, page_count, cover_url)
values
  (
    'The Alchemist', 'Paulo Coelho',
    '{Adventure Fiction,Fable}',
    '{"quest narrative","coming of age","mentor figure"}',
    '{hopeful,reflective,inspiring}',
    '{paperback}',
    'The secret of life, though, is to fall seven times and to get up eight times.',
    13, null, 197,
    'https://static.wixstatic.com/media/d771aa_55a1a2e934734eb69cbcba2a9da0ae69~mv2.jpg/v1/crop/x_0,y_93,w_661,h_814/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/alchemist.jpg'
  ),
  (
    'The Giver', 'Lois Lowry',
    '{Dystopian,"Science Fiction"}',
    '{"chosen one","hidden truth","coming of age"}',
    '{tense,thought-provoking,melancholy}',
    '{paperback}',
    'We gained control of many things. But we had to let go of others.',
    11, 15, 208,
    'https://static.wixstatic.com/media/d771aa_e30969cdc1824567a2003315f1dd878c~mv2.jpg/v1/crop/x_0,y_93,w_661,h_814/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/thegiver.jpg'
  ),
  (
    'The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid',
    '{Romance,"Historical Fiction"}',
    '{"forbidden love","rags to riches","unreliable narrator","secret identity"}',
    '{emotional,glamorous,bittersweet}',
    '{paperback,audiobook}',
    'Never let anyone make you feel ordinary.',
    16, null, 389,
    'https://static.wixstatic.com/media/d771aa_e9966cec13a840d7a534e5535e8d506d~mv2.jpg/v1/crop/x_0,y_104,w_643,h_792/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/sevenhus.jpg'
  ),
  (
    'The Miraculous Journey of Edward Tulane', 'Kate DiCamillo',
    '{"Children''s Literature"}',
    '{"journey home","learning to love","talking object"}',
    '{gentle,bittersweet,heartwarming}',
    '{hardcover,paperback}',
    'If you have no intention of loving or being loved, the whole journey is pointless.',
    7, 11, 228,
    'https://static.wixstatic.com/media/d771aa_df91bb4fc20347adb1a65037f1657d75~mv2.jpg/v1/crop/x_0,y_86,w_673,h_829/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/edwardtulane.jpg'
  ),
  (
    'Never Let Me Go', 'Kazuo Ishiguro',
    '{"Science Fiction","Speculative Fiction"}',
    '{"unreliable narrator","hidden truth","love triangle","boarding school"}',
    '{haunting,melancholy,thought-provoking}',
    '{paperback}',
    'Memories, even your most precious ones, fade surprisingly quickly.',
    16, null, 288,
    'https://static.wixstatic.com/media/d771aa_bf7e2a6a6a154f9cbf7db16981110862~mv2.jpg/v1/crop/x_0,y_73,w_694,h_855/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ishiguro.jpg'
  ),
  (
    'Pachinko', 'Min Jin Lee',
    '{"Historical Fiction","Literary Fiction"}',
    '{"family saga","immigrant experience","generational trauma"}',
    '{sweeping,emotional,resilient}',
    '{paperback,audiobook}',
    'Living every day in the presence of those who refuse to acknowledge your humanity takes great courage.',
    16, null, 490,
    'https://static.wixstatic.com/media/d771aa_9b4961cbfe5d4bf2b64a88329f55d0e8~mv2.webp/v1/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/pachinko.webp'
  ),
  (
    'The Art of Thinking Clearly', 'Rolf Dobelli',
    '{Self-Help,Nonfiction,Psychology}',
    '{"short chapters","practical takeaways"}',
    '{informative,sharp,practical}',
    '{paperback,ebook}',
    'We prefer a simple lie to a complex truth.',
    15, null, 322,
    'https://static.wixstatic.com/media/d771aa_9c67c8092649492dbf391228b41d34ca~mv2.jpg/v1/crop/x_0,y_58,w_418,h_515/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/dobelli.jpg'
  ),
  (
    'One Of Us Is Lying', 'Karen M. McManus',
    '{Mystery,Thriller,"Young Adult"}',
    '{whodunit,"multiple POV","high school","closed circle"}',
    '{suspenseful,twisty,addictive}',
    '{paperback,audiobook}',
    'Things that break—be they bones, hearts, or promises—can be put back together again.',
    13, 18, 361,
    'https://static.wixstatic.com/media/d771aa_5cde328cc9bb438eacba251d5e7f0276~mv2.jpg/v1/crop/x_0,y_57,w_419,h_516/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/mcmanus.jpg'
  ),
  (
    'The Hate U Give', 'Angie Thomas',
    '{Contemporary,"Young Adult"}',
    '{"coming of age","finding your voice","two worlds"}',
    '{urgent,emotional,empowering}',
    '{paperback,audiobook}',
    'What''s the point of having a voice if you''re going to be silent in those moments you shouldn''t be?',
    14, null, 444,
    'https://static.wixstatic.com/media/d771aa_6fa20899981446c7b7b4ed1118c5b33d~mv2.jpg/v1/fill/w_315,h_388,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/angiethomas.jpg'
  )
on conflict do nothing;

-- Give every seeded title two physical copies to start with, so the
-- inventory side has something to work against. Adjust to match what
-- is actually on your shelf.
insert into copies (book_id, condition, status)
select b.id, 'good', 'available'
from books b, generate_series(1, 2)
where not exists (select 1 from copies c where c.book_id = b.id);
