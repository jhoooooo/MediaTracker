import React, { FunctionComponent, useEffect, useState } from 'react';

import { setLastSeenEpisode, useDetails } from 'src/api/details';
import { Modal } from 'src/components/Modal';
import { SelectSeenDateComponent } from 'src/components/SelectSeenDate';
import { MediaItemDetailsResponse, TvSeason } from 'mediatracker-api';

export const SelectLastSeenEpisode: FunctionComponent<{
  tvShow: MediaItemDetailsResponse;
  season?: TvSeason;
  closeModal: (selected?: boolean) => void;
}> = (props) => {
  const { closeModal, season } = props;

  const { mediaItem: tvShow, isLoading } = useDetails(props.tvShow.id);

  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(season?.id);

  const selectedSeason = tvShow?.seasons?.find(
    (value) => value.id === selectedSeasonId
  );

  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number>(
    selectedSeason?.episodes[selectedSeason?.episodes.length - 1].id
  );

  const selectedEpisode = selectedSeason?.episodes?.find(
    (episode) => episode.id === selectedEpisodeId
  );

  useEffect(() => {
    if (season || !tvShow || tvShow?.seasons?.length === 0) {
      return;
    }

    const seasonsWithEpisodes = tvShow.seasons.filter(
      (season) => season.episodes.length > 0
    );

    const firstSeason = seasonsWithEpisodes[seasonsWithEpisodes.length - 1];

    setSelectedSeasonId(firstSeason.id);
    setSelectedEpisodeId(
      firstSeason.episodes[firstSeason.episodes.length - 1].id
    );
  }, [tvShow, season]);

  return (
    <div className="p-3 rounded ">
      {isLoading ? (
        <>Loading</>
      ) : (
        <>
          <div className="py-2 text-2xl font-bold">
            What is the last episode you seen?
          </div>
          <div className="text-lg">
            {!season && (
              <div className="py-2">
                <span className="mr-2">Season:</span>
                <select
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
                >
                  {tvShow.seasons
                    ?.filter((season) => !season.isSpecialSeason)
                    .map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="py-2">
              <span className="mr-2">Episode:</span>
              <select
                value={selectedEpisodeId}
                onChange={(e) => setSelectedEpisodeId(Number(e.target.value))}
              >
                {selectedSeason?.episodes?.map((episode) => (
                  <option key={episode.id} value={episode.id}>
                    {!episode.title.endsWith(` ${episode.episodeNumber}`) &&
                      episode.episodeNumber + '. '}

                    {episode.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <Modal
              closeOnBackgroundClick={true}
              closeOnEscape={true}
              onBeforeClosed={() => closeModal(true)}
              openModal={(onClick) => (
                <div className="btn-blue" onClick={onClick}>
                  Select
                </div>
              )}
            >
              {(closeModal) => (
                <SelectSeenDateComponent
                  closeModal={closeModal}
                  onSelected={async (args) => {
                    closeModal();

                    await setLastSeenEpisode({
                      mediaItem: tvShow,
                      lastSeenAt: args.seenAt,
                      date: args.date,
                      episode: selectedEpisode,
                      season: season ? selectedSeason : undefined,
                    });
                  }}
                />
              )}
            </Modal>

            <div className="btn-red" onClick={() => closeModal()}>
              Cancel
            </div>
          </div>
        </>
      )}
    </div>
  );
};