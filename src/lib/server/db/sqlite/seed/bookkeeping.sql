DELETE FROM tag;
DELETE FROM account;
DELETE FROM account_tag;

INSERT INTO tag (
  name
) VALUES
  ("7-11"),
  ("Lotus")
;

INSERT INTO account
  (code, name, is_debit)
VALUES
  ("1001", "Cash", TRUE)
;

INSERT INTO account_tag
  (account_id, tag_id)
VALUES
  (1, 1)
;

SELECT *
  FROM account
  INNER JOIN account_tag USING (account_id)
  INNER JOIN tag USING (tag_id);
