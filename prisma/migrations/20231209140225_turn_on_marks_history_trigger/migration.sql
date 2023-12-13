CREATE OR REPLACE FUNCTION public.history_marks_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ begin if (
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
            select students.id
            from students
            where id = new."studentId"
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
        select students.id
        from students
       where id = old."studentId"
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
            select students.id
            from students
            where id = old."studentId"
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
$function$
;


create or replace trigger history_marks_change
after
update
    or delete on marks for each row execute procedure history_marks_change();