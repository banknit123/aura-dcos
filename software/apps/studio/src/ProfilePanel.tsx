import { useMemo, useState } from 'react';
import { createAuraProfileStore, type AuraProfile } from '@aura-dcos/profile-store';
import type { AuraCabinContext } from '@aura-dcos/digital-twin';
import type { AuraSurface } from '@aura-dcos/surfaces';
import './profile.css';

export interface StudioProfileData {
  context: AuraCabinContext;
  surfaces: AuraSurface[];
}

interface ProfilePanelProps {
  data: StudioProfileData;
  onLoad: (data: StudioProfileData) => void;
}

const STORAGE_KEY = 'aura-dcos-layout-profiles';

export function ProfilePanel({ data, onLoad }: ProfilePanelProps) {
  const store = useMemo(() => createAuraProfileStore<StudioProfileData>(localStorage, STORAGE_KEY), []);
  const [profiles, setProfiles] = useState<AuraProfile<StudioProfileData>[]>(() => store.list());
  const [name, setName] = useState('Prototype Layout');

  function refresh(): void {
    setProfiles(store.list());
  }

  function saveProfile(): void {
    store.save(name.trim() || 'Prototype Layout', data);
    refresh();
  }

  function loadProfile(profileId: string): void {
    onLoad(store.load(profileId).data);
  }

  function deleteProfile(profileId: string): void {
    store.remove(profileId);
    refresh();
  }

  return (
    <section className="profile-panel">
      <h2>Layout Profiles</h2>
      <p className="muted">Save and restore cabin surface layouts from this browser.</p>

      <div className="profile-save-row">
        <input value={name} onChange={(event) => setName(event.currentTarget.value)} aria-label="Profile name" />
        <button onClick={saveProfile}>Save</button>
      </div>

      <div className="mini-grid">
        {profiles.length === 0 ? <small>No saved profiles yet.</small> : null}
        {profiles.map((profile) => (
          <article key={profile.id}>
            <strong>{profile.name}</strong>
            <small>Updated {new Date(profile.updatedAt).toLocaleString()}</small>
            <div className="profile-actions">
              <button onClick={() => loadProfile(profile.id)}>Load</button>
              <button onClick={() => deleteProfile(profile.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
