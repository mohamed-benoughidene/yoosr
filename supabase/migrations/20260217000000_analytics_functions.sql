-- Function to get daily conversation stats
CREATE OR REPLACE FUNCTION get_daily_conversations_stats(
  p_project_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  total_count BIGINT,
  open_count BIGINT,
  closed_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'open') as open_count,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_count
  FROM
    conversations
  WHERE
    project_id = p_project_id
    AND created_at >= p_start_date
    AND created_at <= (p_end_date + INTERVAL '1 day')
  GROUP BY
    DATE(created_at)
  ORDER BY
    DATE(created_at);
END;
$$;

-- Function to get visitor stats
CREATE OR REPLACE FUNCTION get_daily_visitors_stats(
  p_project_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  visitor_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(DISTINCT COALESCE(visitor_id, 'unknown')) as visitor_count
  FROM
    conversations
  WHERE
    project_id = p_project_id
    AND created_at >= p_start_date
    AND created_at <= (p_end_date + INTERVAL '1 day')
  GROUP BY
    DATE(created_at)
  ORDER BY
    DATE(created_at);
END;
$$;

-- Function to get response time stats (simplified)
CREATE OR REPLACE FUNCTION get_response_time_stats(
  p_project_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  avg_response_time_seconds NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Placeholder: Return 0 for now as complex join is heavy without dedicated stats table
  -- Real implementation would join messages M1 (visitor) with M2 (agent) where M2.created_at > M1.created_at
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    0::NUMERIC as avg_response_time_seconds
  FROM
    conversations
  WHERE
    project_id = p_project_id
    AND created_at >= p_start_date
    AND created_at <= (p_end_date + INTERVAL '1 day')
  GROUP BY
    DATE(created_at)
  ORDER BY
    DATE(created_at);
END;
$$;
