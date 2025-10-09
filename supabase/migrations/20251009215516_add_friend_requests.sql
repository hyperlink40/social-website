/*
  # Add Friend Request System

  1. New Tables
    - `friend_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `status` (text: 'pending', 'accepted', 'rejected')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on friend_requests table
    - Users can view requests where they are sender or receiver
    - Users can create requests where they are the sender
    - Users can update requests where they are the receiver
    - Users can delete their own sent requests

  3. Important Notes
    - Unique constraint prevents duplicate friend requests
    - Status defaults to 'pending'
    - Check constraint prevents self-friend requests
    - Indexes added for performance
*/

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Friend request policies
CREATE POLICY "Users can view their friend requests"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received friend requests"
  ON friend_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their sent friend requests"
  ON friend_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS friend_requests_sender_id_idx ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS friend_requests_receiver_id_idx ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS friend_requests_status_idx ON friend_requests(status);