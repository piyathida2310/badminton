-- ---------- USERS ----------
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    user_name TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INT,
    gender public.gender_enum,
    role public.role_enum NOT NULL DEFAULT 'PLAYER',
    play_type public.play_type_enum,
    profile_img TEXT,
    gmail TEXT UNIQUE,
    clerk_id TEXT UNIQUE,
    phone_number TEXT,
    rank INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- RULES ----------
CREATE TABLE public.rules (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- TOURNAMENTS ----------
CREATE TABLE public.tournaments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    play_type public.play_type_enum NOT NULL,
    rank TEXT[], -- Array of strings
    shuttle_price DOUBLE PRECISION NOT NULL,
    max_players INT NOT NULL,
    poster_img TEXT,
    qr_code_img TEXT,
    start_date TIMESTAMP NOT NULL,
    rule_id INT NOT NULL,
    is_lower_bracket BOOLEAN NOT NULL DEFAULT FALSE,
    is_cancel BOOLEAN NOT NULL DEFAULT FALSE,
    organizer_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES public.users (id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES public.rules (id) ON DELETE CASCADE
);

-- ---------- GROUPS ----------
CREATE TABLE public.groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    tournament_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES public.tournaments (id) ON DELETE CASCADE
);

-- ---------- REGISTRATIONS ----------
CREATE TABLE public.registrations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    tournament_id INT NOT NULL,
    team_name TEXT,
    hand_type public.hand_type_enum NOT NULL,
    phone_number TEXT NOT NULL,
    video_url TEXT,
    status public.evaluation_status_enum NOT NULL DEFAULT 'WAITING',
    score DOUBLE PRECISION,
    comment TEXT,
    manager_name TEXT,
    player1_name TEXT,
    player1_gender public.gender_enum,
    player1_birthday TIMESTAMP,
    player2_name TEXT,
    player2_gender public.gender_enum,
    player2_phone TEXT,
    player2_birthday TIMESTAMP,
    group_id INT,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
    FOREIGN KEY (tournament_id) REFERENCES public.tournaments (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES public.groups (id) ON DELETE SET NULL
);

-- ---------- PAYMENTS ----------
CREATE TABLE public.payments (
    id SERIAL PRIMARY KEY,
    register_id INT UNIQUE NOT NULL,
    slip_img TEXT,
    status public.payment_status_enum NOT NULL DEFAULT 'PENDING',
    confirmed_by_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_id) REFERENCES public.registrations (id) ON DELETE CASCADE,
    FOREIGN KEY (confirmed_by_id) REFERENCES public.users (id) ON DELETE SET NULL
);

-- ---------- CANCELLATIONS ----------
CREATE TABLE public.cancellation_requests (
    id SERIAL PRIMARY KEY,
    register_id INT UNIQUE NOT NULL,
    reason TEXT,
    status public.cancellation_status_enum NOT NULL DEFAULT 'REQUESTED',
    bank_name TEXT,
    account_num TEXT,
    account_name TEXT,
    qr_code TEXT,
    refund_slip TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (register_id) REFERENCES public.registrations (id) ON DELETE CASCADE
);

-- ---------- MATCHES (GROUP) ----------
CREATE TABLE public.group_matches (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL,
    group_id INT NOT NULL,
    hand_type public.hand_type_enum,
    round_name TEXT,
    match_sequence INT,
    player1_id INT,
    player2_id INT,
    winner_id INT,
    score1 INT,
    score2 INT,
    sets TEXT,
    shuttle INT,
    status public.match_status_enum NOT NULL DEFAULT 'PENDING',
    scheduled_time TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES public.tournaments (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES public.groups (id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES public.registrations (id),
    FOREIGN KEY (player2_id) REFERENCES public.registrations (id),
    FOREIGN KEY (winner_id) REFERENCES public.registrations (id)
);

-- ---------- MATCHES (BRACKET) ----------
CREATE TABLE public.bracket_matches (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL,
    hand_type public.hand_type_enum,
    stage public.match_stage_enum NOT NULL DEFAULT 'UPPER',
    round_sequence INT,
    match_sequence INT,
    player1_id INT,
    player2_id INT,
    winner_id INT,
    score1 INT,
    score2 INT,
    sets TEXT,
    shuttle INT,
    status public.match_status_enum NOT NULL DEFAULT 'PENDING',
    scheduled_time TIMESTAMP,
    winner_next_match_id INT,
    winner_next_match_slot public.match_slot_enum,
    loser_next_match_id INT,
    loser_next_match_slot public.match_slot_enum,
    FOREIGN KEY (tournament_id) REFERENCES public.tournaments (id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES public.registrations (id),
    FOREIGN KEY (player2_id) REFERENCES public.registrations (id),
    FOREIGN KEY (winner_id) REFERENCES public.registrations (id),
    FOREIGN KEY (winner_next_match_id) REFERENCES public.bracket_matches (id),
    FOREIGN KEY (loser_next_match_id) REFERENCES public.bracket_matches (id)
);

-- ---------- SUMMARIES & HISTORIES ----------
CREATE TABLE public.summaries (
    id SERIAL PRIMARY KEY,
    tournament_id INT NOT NULL,
    register_id INT NOT NULL,
    position INT NOT NULL,
    total_score DOUBLE PRECISION,
    shuttle_used INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES public.tournaments (id) ON DELETE CASCADE,
    FOREIGN KEY (register_id) REFERENCES public.registrations (id) ON DELETE CASCADE
);

CREATE TABLE public.histories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);