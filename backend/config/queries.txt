// Create table for exercises.
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(128) UNIQUE,
  name VARCHAR(255) NOT NULL UNIQUE,
  body_part VARCHAR(100),
  target VARCHAR(100) NOT NULL,
  equipment VARCHAR(100),
  gif_url TEXT,
  image_url TEXT,
  instructions TEXT[],
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

// create table for search_history.
CREATE TABLE search_history (
  id          SERIAL PRIMARY KEY,
  query_text  VARCHAR(255),
  mood        VARCHAR(50),
  hits        INTEGER DEFAULT 1,
  last_hit_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uq_query_mood UNIQUE (query_text, mood)
);

//create index for searching fastly
CREATE INDEX idx_name_lower ON exercises (LOWER(name));
CREATE INDEX idx_target_lower ON exercises (LOWER(target));
CREATE INDEX idx_query ON search_history (query_text);
CREATE INDEX idx_mood ON search_history (mood);

//VIDEO SECTION QUERIES
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,       
    title TEXT NOT NULL,                       
    description TEXT,                           
    channel_title VARCHAR(255) NOT NULL,        
    published_at TIMESTAMP WITH TIME ZONE,     
    thumbnail_default TEXT,                     
    thumbnail_medium TEXT,                      
    live_broadcast_content VARCHAR(20) DEFAULT 'none',  
    created_at TIMESTAMP DEFAULT NOW(),         
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE videos_history (
   id SERIAL PRIMARY KEY,
  query_text  VARCHAR(255),
  mood  VARCHAR(50),
  hits   INTEGER DEFAULT 1,
  last_hit_at TIMESTAMP DEFAULT NOW()
);


CREATE INDEX idx_video_id ON videos(video_id);
CREATE INDEX idx_channel_title ON videos(channel_title);
CREATE INDEX idx_published_at ON videos(published_at);

// musics QUERIES
CREATE TABLE musics (
  id SERIAL PRIMARY KEY,
  music_id VARCHAR(128) UNIQUE NOT NULL,   
  title VARCHAR(255) NOT NULL,       
  username VARCHAR(200),            
  artwork_url TEXT,                  
  duration INTEGER,                 
  stream_url TEXT,                   
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE musics
ADD COLUMN artist_name VARCHAR(255),
ADD COLUMN artist_avatar TEXT,
ADD COLUMN genre VARCHAR(100),
ADD COLUMN streamable BOOLEAN DEFAULT TRUE,
ADD COLUMN permalink_url TEXT,
ADD COLUMN fetched_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN progressive_url TEXT;

CREATE TABLE musics_history(
  id SERIAL PRIMARY KEY,
  query_text  VARCHAR(255),
  mood  VARCHAR(50),
  hits   INTEGER DEFAULT 1,
  last_hit_at TIMESTAMP DEFAULT NOW()
  CONSTRAINT uq_music_history UNIQUE (query_text, mood);
                      
);


CREATE INDEX idx_musics_music_id ON musics(music_id);
CREATE INDEX idx_musics_title ON musics(title);
CREATE INDEX idx_musics_username ON musics(username);
CREATE INDEX idx_musics_created_at ON musics(created_at);
