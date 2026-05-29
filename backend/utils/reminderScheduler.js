const cron = require("node-cron");
const pool = require("../db");
const sendEmail = require("./emailService");

const startReminderScheduler = () => {
  // RUN EVERY DAY AT 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("Running deadline reminder scheduler...");

    try {
      const result = await pool.query(
        `SELECT 
            dr.id,
            dr.project_id,
            dr.document_id,
            dr.deadline_date,
            dr.reminder_days_before,
            d.file_name,
            u.email
         FROM deadline_reminders dr
         JOIN documents d
           ON dr.document_id = d.id
         JOIN projects p
           ON dr.project_id = p.id
         JOIN users u
           ON p.pi_id = u.id
         WHERE dr.reminder_date = CURRENT_DATE
         AND dr.email_sent = false`
      );

      for (const reminder of result.rows) {
        const emailSubject =
          `Project Deadline Reminder (${reminder.reminder_days_before} Days Left)`;

        const emailMessage =
          `Reminder for project document:\n\n` +
          `Document: ${reminder.file_name}\n` +
          `Deadline: ${new Date(
            reminder.deadline_date
          ).toDateString()}\n\n` +
          `${reminder.reminder_days_before} day(s) remaining.`;

        // SEND EMAIL
        const emailSent = await sendEmail(
          reminder.email,
          emailSubject,
          emailMessage
        );

        // CREATE POPUP NOTIFICATION
        await pool.query(
          `INSERT INTO notifications
           (project_id, title, message, type, document_id)
           VALUES ($1, $2, $3, $4, $5)`,

          [
            reminder.project_id,
            "Deadline Reminder",
            emailMessage,
            "Reminder",
            reminder.document_id,
          ]
        );

        // UPDATE STATUS
        if (emailSent) {
          await pool.query(
            `UPDATE deadline_reminders
             SET email_sent = true,
                 popup_created = true
             WHERE id = $1`,
            [reminder.id]
          );

          console.log(
            `Reminder sent for document ${reminder.file_name}`
          );
        }
      }
    } catch (error) {
      console.error("Reminder Scheduler Error:", error);
    }
  });
};

module.exports = startReminderScheduler;