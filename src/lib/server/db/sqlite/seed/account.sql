-- DOWN
DELETE FROM category_type;
DELETE FROM category;
DELETE FROM account;

-- UP
INSERT INTO category_type(name)
VALUES
  ("asset")
;
-- SELECT * FROM category_type;

-- INSERT INTO category (parent_id, name, category_type_id)
-- VALUES
--   (NULL, "Assets", (SELECT category_type_id FROM category_type WHERE name = "asset"))
-- ;

-- INSERT INTO category (parent_id, name, category_type_id)
-- VALUES
--   ((SELECT category_id FROM category WHERE name = "Assets"), "Current Assets", NULL),
--   ((SELECT category_id FROM category WHERE name = "Assets"), "Non-Current Assets", NULL)
-- ;
-- SELECT * FROM category;

-- INSERT INTO account (category_id, code, name, is_debit)
-- VALUES
--   ((SELECT category_id FROM category WHERE name = "Current Assets"), "1001", "Cash", TRUE)
-- ;
--
-- SELECT * FROM category as parent
-- INNER JOIN category as child
--   ON parent.category_id = child.parent_id
-- INNER JOIN account ON account.category_id = child.category_id
-- WHERE parent.parent_id IS NULL;
