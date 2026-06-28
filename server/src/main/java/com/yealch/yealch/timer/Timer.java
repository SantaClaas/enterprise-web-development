package com.yealch.yealch.timer;

import com.yealch.yealch.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "timers")
public class Timer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "timer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("startedAt ASC")
    private List<TimerStartPause> startPauseEntries = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<TimerStartPause> getStartPauseEntries() {
        return startPauseEntries;
    }

    public void addStartPauseEntry(TimerStartPause entry) {
        entry.setTimer(this);
        startPauseEntries.add(entry);
    }

    public TimerStartPause getLastEntry() {
        if (startPauseEntries.isEmpty()) return null;
        return startPauseEntries.get(startPauseEntries.size() - 1);
    }

    public boolean isRunning() {
        TimerStartPause last = getLastEntry();
        return last != null && last.getPausedAt() == null;
    }
}
