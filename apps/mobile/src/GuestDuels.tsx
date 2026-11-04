import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { randomUUID } from "expo-crypto";
import type { DuelSource, DuelView } from "../../../domain/guest-duels/types";
import {
  duelBase,
  duelRequest,
  guestToken,
  readGuest,
  DuelRequestError,
} from "./duel-client";
import { formStyles as s, scoringLabel } from "./CreateChallengeForm";

export function GuestDuels({
  source,
  onClear,
}: {
  source: DuelSource | null;
  onClear: () => void;
}) {
  const [items, setItems] = useState<DuelView[]>([]),
    [selected, setSelected] = useState<string | null>(null);
  const [invite, setInvite] = useState(() =>
    Platform.OS === "web"
      ? new URLSearchParams(window.location.hash.slice(1)).get("invite")
      : null,
  );
  const [name, setName] = useState(""),
    [days, setDays] = useState("1"),
    [value, setValue] = useState("");
  const [link, setLink] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  const lock = useRef(false);
  const [pending, setPending] = useState<{
    path: string;
    body: unknown;
  } | null>(null);
  const duel = items.find((item) => item.id === selected),
    me = duel?.members.find((member) => member.id === duel.me);
  const visible = !!source || !!invite || !!selected;
  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const token = await readGuest();
        if (token) {
          const list = await duelRequest<DuelView[]>("", token);
          if (alive) setItems(list);
        }
      } catch (e) {
        if (alive)
          setError(e instanceof Error ? e.message : "Duell nicht erreichbar.");
      }
    }
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);
  async function act(
    path: string,
    body: unknown,
    kind: "duel" | "invite" = "duel",
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const token = await guestToken();
      if (kind === "invite") {
        const data = await duelRequest<{ token: string }>(path, token, body);
        setLink(`${duelBase()}/#invite=${data.token}`);
      } else {
        // Preserve exactly the same mutation on retry after an uncertain network response.
        const request = pending ?? { path, body };
        setPending(request);
        const result = await duelRequest<DuelView>(
          request.path,
          token,
          request.body,
        );
        setPending(null);
        setItems((old) => [
          result,
          ...old.filter((item) => item.id !== result.id),
        ]);
        setSelected(result.id);
        setValue("");
        setConfirm(false);
        onClear();
        if (invite) {
          setInvite(null);
          if (Platform.OS === "web")
            window.history.replaceState(null, "", window.location.pathname);
        }
      }
    } catch (e) {
      if (e instanceof DuelRequestError && e.status < 500) setPending(null);
      setError(e instanceof Error ? e.message : "Bitte erneut versuchen.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function close() {
    if (busy) return;
    setSelected(null);
    setInvite(null);
    setLink("");
    setError("");
    setConfirm(false);
    setPending(null);
    onClear();
  }

  return (
    <>
      {!!items.length && (
        <View style={{ gap: 12, marginTop: 24 }}>
          <Text style={s.title}>Meine Duelle</Text>
          {items.map((item) => (
            <Pressable
              accessibilityRole="button"
              style={s.choice}
              key={item.id}
              onPress={() => {
                setSelected(item.id);
                setLink("");
              }}
            >
              <Text style={s.label}>{item.source.title}</Text>
              <Text style={s.body}>
                {item.status === "lobby"
                  ? "Wartet auf den Start"
                  : item.status === "active"
                    ? "Läuft"
                    : "Beendet"}{" "}
                · {item.members.map((m) => m.name).join(" vs ")}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {!!error && !visible && <Text style={s.error}>{error}</Text>}
      <Modal visible={visible} animationType="slide" onRequestClose={close}>
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.page}>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={s.action}
              onPress={close}
            >
              <Text style={s.link}>Zurück</Text>
            </Pressable>
            {(source || invite) && (
              <>
                <Text style={s.heading}>
                  {invite ? "Einladung annehmen" : "1 vs 1 anlegen"}
                </Text>
                <Text style={s.body}>
                  {source?.title ?? "Tritt dem Duell als Gast bei."}
                </Text>
                <Text style={s.label}>Dein Name</Text>
                <TextInput
                  accessibilityLabel="Dein Name im Duell"
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  maxLength={30}
                  editable={!busy && !pending}
                />
                {source && (
                  <>
                    <Text style={s.label}>Zeitfenster in Tagen (1–7)</Text>
                    <TextInput
                      accessibilityLabel="Duell-Tage"
                      style={s.input}
                      value={days}
                      onChangeText={setDays}
                      keyboardType="number-pad"
                      editable={!busy && !pending}
                    />
                    <Text style={s.body}>
                      Der Gastgeber startet, sobald beide da sind. Heute zählt
                      als erster Tag; Tageswechsel ist um 00:00 UTC. Ihr könnt
                      beide früher abschließen.
                    </Text>
                  </>
                )}
                <Text style={s.body}>
                  Ohne Login. Dein Gastzugang gilt 30 Tage. Im Browser bleibt er
                  in diesem Tab erhalten; nach dem Schließen ist kein
                  Wiederherstellen möglich.
                </Text>
                {
                  <DuelButton
                    busy={busy}
                    text={
                      pending
                        ? "Erneut versuchen"
                        : invite
                          ? "Duell beitreten"
                          : "Duell anlegen"
                    }
                    onPress={() =>
                      void act(
                        invite ? "/join" : "",
                        invite
                          ? { token: invite, name }
                          : {
                              source,
                              name,
                              days: Number(days),
                              requestId: randomUUID(),
                            },
                      )
                    }
                  />
                }
              </>
            )}
            {duel && !source && !invite && (
              <>
                <Text style={s.heading}>{duel.source.title}</Text>
                <Text style={s.body}>{duel.source.goal}</Text>
                <Text style={s.body}>{scoringLabel(duel.source)}</Text>
                {duel.source.rules.map((rule, i) => (
                  <Text key={i} style={s.body}>
                    {i + 1}. {rule}
                  </Text>
                ))}
                <Text style={s.body}>
                  {duel.endsAt
                    ? `Ende: ${new Date(duel.endsAt).toLocaleString()} · Tageswechsel 00:00 UTC`
                    : `${duel.durationDays} Kalendertag(e), Tageswechsel 00:00 UTC`}
                </Text>
                {duel.members.map((member) => (
                  <View key={member.id} style={s.choice}>
                    <Text style={s.label}>
                      {member.name}
                      {member.id === duel.me ? " (du)" : ""}
                    </Text>
                    <Text style={s.body}>
                      {member.label}
                      {member.finished ? " · Fertig" : ""}
                    </Text>
                  </View>
                ))}
                {duel.status === "lobby" && (
                  <>
                    <Text style={s.body}>
                      {duel.members.length === 1
                        ? "Warte auf deinen Gegner."
                        : "Beide sind da. Der Gastgeber kann starten."}
                    </Text>
                    {duel.owner && duel.members.length === 1 && (
                      <DuelButton
                        busy={busy}
                        text={
                          link
                            ? "Neuen Einladungslink erzeugen"
                            : "Einladungslink erzeugen"
                        }
                        onPress={() =>
                          void act(`/${duel.id}/invite`, {}, "invite")
                        }
                      />
                    )}
                    {!!link && (
                      <>
                        <Text style={s.body}>
                          24 Stunden gültig, für einen Gegner. Ein neuer Link
                          ersetzt den vorherigen.
                        </Text>
                        <TextInput
                          accessibilityLabel="Einladungslink"
                          value={link}
                          editable={false}
                          selectTextOnFocus
                          style={s.input}
                        />
                        {
                          <DuelButton
                            busy={busy}
                            text={"Einladung teilen"}
                            onPress={() => {
                              void Share.share({ message: link }).catch(() =>
                                setError("Bitte kopiere den Link."),
                              );
                            }}
                          />
                        }
                      </>
                    )}
                    {duel.owner && duel.members.length === 2 && (
                      <DuelButton
                        busy={busy}
                        text={"Duell starten"}
                        onPress={() => void act(`/${duel.id}/start`, {})}
                      />
                    )}
                  </>
                )}
                {duel.status === "active" && !me?.finished && (
                  <>
                    {duel.source.definition.type !== "daily_boolean" && (
                      <>
                        <Text style={s.label}>
                          Messwert ({duel.source.definition.unit})
                        </Text>
                        <TextInput
                          accessibilityLabel="Duell-Messwert"
                          keyboardType="decimal-pad"
                          style={s.input}
                          value={value}
                          onChangeText={setValue}
                          editable={!busy && !pending}
                        />
                      </>
                    )}
                    {
                      <DuelButton
                        busy={busy}
                        text={
                          pending
                            ? "Erneut versuchen"
                            : duel.source.definition.type === "daily_boolean"
                              ? "Heute abhaken"
                              : "Ergebnis speichern"
                        }
                        onPress={() =>
                          void act(`/${duel.id}/entries`, {
                            requestId: randomUUID(),
                            value:
                              duel.source.definition.type === "daily_boolean"
                                ? null
                                : Number(value.replace(",", ".")),
                          })
                        }
                      />
                    }
                    {confirm ? (
                      <>
                        <Text style={s.body}>
                          Abschließen? Danach kannst du keine Ergebnisse mehr
                          eintragen.
                        </Text>
                        {
                          <DuelButton
                            busy={busy}
                            text={"Endgültig abschließen"}
                            onPress={() => void act(`/${duel.id}/finish`, {})}
                          />
                        }
                      </>
                    ) : (
                      <DuelButton
                        busy={busy}
                        text={"Ich bin fertig"}
                        onPress={() => setConfirm(true)}
                      />
                    )}
                  </>
                )}
                {duel.status === "active" && me?.finished && (
                  <Text style={s.body}>
                    Du bist fertig. Warte auf deinen Gegner oder das Ende des
                    Zeitfensters.
                  </Text>
                )}
                {duel.result && (
                  <Text style={s.title}>
                    {duel.result.tie
                      ? "Unentschieden"
                      : `${duel.members.find((m) => m.id === duel.result?.winnerId)?.name} gewinnt!`}
                  </Text>
                )}
                <Text style={s.label}>Deine Einträge</Text>
                {me?.entries.map((entry) => (
                  <Text key={entry.id} style={s.body}>
                    {new Date(entry.at).toLocaleString()} ·{" "}
                    {entry.value ?? "Abgehakt"}
                  </Text>
                ))}
              </>
            )}
            {!!error && (
              <Text accessibilityRole="alert" style={s.error}>
                {error}
              </Text>
            )}
            {busy && <Text style={s.body}>Wird gespeichert …</Text>}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function DuelButton({
  busy,
  text,
  onPress,
}: {
  busy: boolean;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      style={s.primary}
      onPress={onPress}
    >
      <Text style={s.primaryText}>{text}</Text>
    </Pressable>
  );
}
