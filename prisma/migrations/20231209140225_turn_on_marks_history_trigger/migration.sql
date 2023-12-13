create trigger history_marks_change
after
update
    or delete on marks for each row execute procedure history_marks_change();