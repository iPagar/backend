create table history_marks (
    id serial,
    student integer,
    semester varchar(10) REFERENCES semesters(semester),
    subject varchar (200),
    module varchar(2),
    prev_value integer,
    next_value integer,
    operation text,
    created_at TIMESTAMP DEFAULT NOW()
);
create function history_marks_change() returns trigger as $$ begin if (
    TG_OP = 'UPDATE'
    and new.value <> old.value
) then
insert into history_marks (
        student,
        semester,
        subject,
        module,
        prev_value,
        next_value,
        operation
    )
values (
        (
            select student
            from students
            where id = new.id
        ),
        new.semester,
        new.subject,
        new.module,
        old.value,
        new.value,
        TG_OP
    );
elsif (
    TG_OP = 'DELETE'
    and (
        select student
        from students
        where id = old.id
    ) is not null
) then
insert into history_marks (
        student,
        semester,
        subject,
        module,
        prev_value,
        next_value,
        operation
    )
values (
        (
            select student
            from students
            where id = old.id
        ),
        old.semester,
        old.subject,
        old.module,
        old.value,
        null,
        TG_OP
    );
end if;
return new;
end;
$$ language plpgsql;
create trigger history_marks_change
after
update
    or delete on marks for each row execute procedure history_marks_change();